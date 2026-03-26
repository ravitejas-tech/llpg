// @ts-nocheck
import { useState } from 'react';
import { IndianRupee, CheckCircle, AlertTriangle, CalendarDays } from 'lucide-react';
import { useAuthStore } from '~/store/auth.store';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import { formatCurrency, getStatusColor, MONTH_NAMES } from '~/lib/utils';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';

import { useAdminBuildingIds } from '~/queries/buildings.query';
import { useMonthlyPayments, useMarkPaymentPaid } from '~/queries/payments.query';

const paymentSchema = z.object({
  payment_mode: z.enum(['UPI', 'Cash', 'Bank']),
  remarks: z.string().optional()
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentsPage() {
  const { user } = useAuthStore();
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment_mode: 'UPI', remarks: '' }
  });

  const { data: buildingIds = [] } = useAdminBuildingIds({
    variables: { adminId: user?.id || '' },
    enabled: !!user?.id,
  });

  const { data: payments = [], isLoading: loading } = useMonthlyPayments({
    variables: { 
      buildingIds, 
      month: parseInt(filterMonth), 
      year: parseInt(filterYear) 
    },
    enabled: buildingIds.length > 0
  });

  const { mutateAsync: markPaid } = useMarkPaymentPaid();

  const onSubmit = async (values: PaymentFormValues) => {
    if (!selectedPayment) return;
    try {
      await markPaid({
        paymentId: selectedPayment.id,
        payment_mode: values.payment_mode,
        remarks: values.remarks || null
      });
      
      toast.success("Payment logged successfully");
      setDialogOpen(false);
      form.reset();
    } catch (err: any) {
      toast.error(err.message || "Failed to log payment");
    }
  };

  const openPaymentDialog = (p: any) => {
    setSelectedPayment(p);
    form.reset();
    setDialogOpen(true);
  };

  const totalDue = payments.filter(p => p.status === 'PENDING').reduce((a,c) => a+Number(c.amount), 0);
  const totalCollected = payments.filter(p => p.status === 'PAID').reduce((a,c) => a+Number(c.amount), 0);
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
            Rent Log & Payments
          </h1>
          <p className="text-slate-500 mt-1">Track collections and pending outstandings</p>
        </div>

        <div className="flex gap-2">
           <Select value={filterMonth} onValueChange={setFilterMonth}>
             <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
             <SelectContent>
               {MONTH_NAMES.map((m, i) => <SelectItem key={i} value={(i+1).toString()}>{m}</SelectItem>)}
             </SelectContent>
           </Select>
           <Select value={filterYear} onValueChange={setFilterYear}>
             <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
             <SelectContent>
               {[2024,2025,2026,2027].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
             </SelectContent>
           </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-md shadow-emerald-500/20">
            <CardContent className="p-6">
               <p className="text-emerald-100 font-medium mb-1">Total Collected</p>
               <h2 className="text-4xl font-extrabold">{formatCurrency(totalCollected)}</h2>
               <div className="mt-4 flex items-center gap-2 text-sm text-emerald-100/80">
                 <CheckCircle className="w-4 h-4" /> Cleared Payments
               </div>
            </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white border-none shadow-md shadow-red-500/20">
            <CardContent className="p-6">
               <p className="text-red-100 font-medium mb-1">Total Pending Dues</p>
               <h2 className="text-4xl font-extrabold">{formatCurrency(totalDue)}</h2>
               <div className="mt-4 flex items-center gap-2 text-sm text-red-100/80">
                 <AlertTriangle className="w-4 h-4" /> Requires follow-up
               </div>
            </CardContent>
         </Card>
         <Card className="bg-slate-800 text-white border-none shadow-md">
            <CardContent className="p-6 flex flex-col justify-center h-full">
               <div className="flex flex-col items-center text-center">
                 <span className="text-4xl font-extrabold text-blue-400">{pendingCount}</span>
                 <p className="text-slate-400 font-medium mt-1">Defaulters this month</p>
               </div>
            </CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-slate-100">
           <CardTitle className="flex justify-between items-center">
              <span>Ledger: {MONTH_NAMES[parseInt(filterMonth)-1]} {filterYear}</span>
           </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <p className="p-8 text-center text-slate-500">Loading ledger...</p>
          ) : payments.length === 0 ? (
             <div className="p-8 text-center text-slate-500">
               <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-3" />
               <p>No payment records generated for this month.</p>
             </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map(p => {
                const isPaid = p.status === 'PAID';
                return (
                  <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-50 gap-4">
                    <div className="flex items-start gap-4">
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                         {isPaid ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-slate-900">{p.resident?.name || 'Unknown'}</h3>
                         <div className="text-sm text-slate-500 flex items-center gap-3 mt-1">
                           <span>Room: {p.resident?.room?.room_number || '-'}</span>
                           <span className="w-1 h-1 bg-slate-300 rounded-full" />
                           <span>{p.resident?.phone || '-'}</span>
                         </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                      <div className="text-left md:text-right">
                         <div className="text-xl font-bold text-slate-900">{formatCurrency(p.amount)}</div>
                         <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                      </div>

                      {!isPaid && (
                        <Button onClick={() => openPaymentDialog(p)} className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
                           Mark as Paid
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(val) => { setDialogOpen(val); if(!val) form.reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment Received</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center text-lg">
                   <span className="text-slate-600 font-medium">Clear Outstanding:</span>
                   <span className="font-extrabold text-slate-900">{formatCurrency(selectedPayment.amount)}</span>
                 </div>
                 
                 <div className="space-y-4">
                   <FormField
                     control={form.control}
                     name="payment_mode"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Payment Method *</FormLabel>
                         <Select value={field.value} onValueChange={field.onChange}>
                           <FormControl>
                             <SelectTrigger><SelectValue /></SelectTrigger>
                           </FormControl>
                           <SelectContent>
                             <SelectItem value="UPI">UPI / GPay / PayTM</SelectItem>
                             <SelectItem value="Cash">Physical Cash</SelectItem>
                             <SelectItem value="Bank">Bank Transfer (NEFT/IMPS)</SelectItem>
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="remarks"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Remarks / Ref No (Optional)</FormLabel>
                         <FormControl>
                           <Input placeholder="e.g. UTR Number or Cash Handover details" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </div>

                 <div className="flex gap-3 pt-2">
                   <Button type="button" variant="outline" className="flex-1" onClick={()=>setDialogOpen(false)}>Cancel</Button>
                   <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={form.formState.isSubmitting}>
                      Confirm Receipt
                   </Button>
                 </div>
               </form>
             </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
