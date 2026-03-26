import { createQuery, createMutation } from 'react-query-kit';
import { supabase, unwrapSupabaseResponse } from './utils';
import { queryClient } from './client';
import type { Database } from '~/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────

type PaymentRow = Database['public']['Tables']['payments']['Row'];

export interface PaymentWithResident extends PaymentRow {
  resident: {
    name: string;
    phone: string;
    room_id: string;
    room: { room_number: string } | null;
    building?: { name: string } | null;
  } | null;
}

// ─── Query Keys ───────────────────────────────────────────────────────────

export const paymentKeys = {
  all: ['payments'] as const,
  byResident: (residentId: string) => [...paymentKeys.all, 'resident', residentId] as const,
  byMonthYear: (month: number, year: number) => [...paymentKeys.all, 'month', month, year] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────

interface PaymentsQueryVariables {
  buildingIds: string[];
  month: number;
  year: number;
}

/** Fetch payments for a given month/year across building IDs (admin view) */
export const useMonthlyPayments = createQuery<PaymentWithResident[], PaymentsQueryVariables>({
  queryKey: paymentKeys.all,
  fetcher: async (variables) => {
    if (variables.buildingIds.length === 0) return [];

    // Get all residents for these buildings
    const { data: resData } = await supabase
      .from('residents')
      .select('id')
      .in('building_id', variables.buildingIds);
      
    const residentIds = resData?.map(r => r.id) || [];
    if (residentIds.length === 0) return [];

    // Auto-generate missing payment records for active monthly residents
    const { data: activeRes } = await supabase
      .from('residents')
      .select('id, monthly_rent, stay_type')
      .in('id', residentIds)
      .eq('status', 'ACTIVE')
      .eq('stay_type', 'MONTHLY');

    if (activeRes && activeRes.length > 0) {
      const { data: existingPymts } = await supabase
        .from('payments')
        .select('resident_id')
        .in('resident_id', activeRes.map((r) => r.id))
        .eq('month', variables.month)
        .eq('year', variables.year);

      const existingIds = existingPymts?.map((p) => p.resident_id) || [];
      const missing = activeRes.filter((r) => !existingIds.includes(r.id));

      if (missing.length > 0) {
        const inserts = missing.map((r) => ({
          resident_id: r.id,
          month: variables.month,
          year: variables.year,
          amount: r.monthly_rent || 0,
          status: 'PENDING' as const,
        }));
        await supabase.from('payments').insert(inserts);
      }
    }

    // Fetch payments with resident info
    const response = await supabase
      .from('payments')
      .select(`
        *,
        resident:residents(name, phone, room_id, room:rooms(room_number))
      `)
      .in('resident_id', residentIds)
      .eq('month', variables.month)
      .eq('year', variables.year)
      .order('status', { ascending: false })
      .order('created_at', { ascending: false });

    return unwrapSupabaseResponse(response) as PaymentWithResident[];
  },
});

/** Fetch payment history for a single resident */
export const useResidentPayments = createQuery<PaymentRow[], { residentId: string }>({
  queryKey: paymentKeys.all,
  fetcher: async (variables) => {
    const response = await supabase
      .from('payments')
      .select('*')
      .eq('resident_id', variables.residentId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    return unwrapSupabaseResponse(response) as PaymentRow[];
  },
});

/** Fetch payments for resident's own view (by user_id, needs resident lookup) */
export const useMyPayments = createQuery<PaymentRow[], { userId: string }>({
  queryKey: paymentKeys.all,
  fetcher: async (variables) => {
    const { data: resData } = await supabase
      .from('residents')
      .select('id')
      .eq('user_id', variables.userId)
      .maybeSingle();

    if (!resData) return [];

    const response = await supabase
      .from('payments')
      .select('*')
      .eq('resident_id', resData.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    return unwrapSupabaseResponse(response) as PaymentRow[];
  },
});

/** Fetch defaulters (pending payments for reminders page) */
export const useDefaulters = createQuery<PaymentWithResident[], { buildingIds: string[]; month: number; year: number }>({
  queryKey: paymentKeys.all,
  fetcher: async (variables) => {
    if (variables.buildingIds.length === 0) return [];

    const { data: resData } = await supabase
      .from('residents')
      .select('id')
      .in('building_id', variables.buildingIds);

    const residentIds = resData?.map((r) => r.id) || [];
    if (residentIds.length === 0) return [];

    const response = await supabase
      .from('payments')
      .select(`
        *,
        resident:residents(name, phone, room:rooms(room_number), building:buildings(name))
      `)
      .in('resident_id', residentIds)
      .eq('status', 'PENDING')
      .eq('month', variables.month)
      .eq('year', variables.year);

    return unwrapSupabaseResponse(response) as PaymentWithResident[];
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

interface MarkPaymentPaidVariables {
  paymentId: string;
  payment_mode: 'UPI' | 'Cash' | 'Bank';
  remarks: string | null;
}

export const useMarkPaymentPaid = createMutation<void, MarkPaymentPaidVariables>({
  mutationFn: async (variables) => {
    const response = await supabase.from('payments').update({
      status: 'PAID',
      paid_date: new Date().toISOString(),
      payment_mode: variables.payment_mode,
      remarks: variables.remarks,
    }).eq('id', variables.paymentId);
    unwrapSupabaseResponse(response);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: paymentKeys.all });
  },
});

// ─── Invalidation helpers ─────────────────────────────────────────────────

export function invalidatePayments() {
  queryClient.invalidateQueries({ queryKey: paymentKeys.all });
}
