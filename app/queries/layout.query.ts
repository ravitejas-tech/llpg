import { createQuery, createMutation } from 'react-query-kit';
import { supabase, unwrapSupabaseResponse } from './utils';
import { queryClient } from './client';

// ─── Types ────────────────────────────────────────────────────────────────

export interface FloorWithRooms {
  id: string;
  building_id: string;
  floor_number: string;
  rooms: RoomWithSeats[];
}

export interface RoomWithSeats {
  id: string;
  floor_id: string;
  room_number: string;
  total_seats: number;
  seats: SeatInfo[];
}

export interface SeatInfo {
  id: string;
  room_id: string;
  seat_number: string;
  status: 'AVAILABLE' | 'OCCUPIED';
}

export interface FloorBasic {
  id: string;
  floor_number: string;
}

export interface RoomBasic {
  id: string;
  room_number: string;
}

export interface SeatBasic {
  id: string;
  seat_number: string;
}

// ─── Query Keys ───────────────────────────────────────────────────────────

export const layoutKeys = {
  all: ['layout'] as const,
  byBuilding: (buildingId: string) => [...layoutKeys.all, buildingId] as const,
  floors: (buildingId: string) => ['floors', buildingId] as const,
  rooms: (floorId: string) => ['rooms', floorId] as const,
  seats: (roomId: string) => ['seats', roomId] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────

/** Fetch full building layout (floors > rooms > seats) */
export const useBuildingLayout = createQuery<FloorWithRooms[], { buildingId: string }>({
  queryKey: layoutKeys.all,
  fetcher: async (variables) => {
    const response = await supabase
      .from('floors')
      .select('*, rooms(*, seats(*))')
      .eq('building_id', variables.buildingId)
      .order('floor_number', { ascending: true });
    return unwrapSupabaseResponse(response) as FloorWithRooms[];
  },
});

/** Fetch floors for a building (dropdown) */
export const useFloors = createQuery<FloorBasic[], { buildingId: string }>({
  queryKey: ['floors'],
  fetcher: async (variables) => {
    const response = await supabase
      .from('floors')
      .select('id, floor_number')
      .eq('building_id', variables.buildingId);
    return unwrapSupabaseResponse(response) as FloorBasic[];
  },
});

/** Fetch rooms for a floor (dropdown) */
export const useRooms = createQuery<RoomBasic[], { floorId: string; roomTypeId?: string; sharingTypeId?: string }>({
  queryKey: ['rooms'],
  fetcher: async (variables) => {
    let query = supabase
      .from('rooms')
      .select('id, room_number')
      .eq('floor_id', variables.floorId);
    
    if (variables.roomTypeId && variables.roomTypeId !== 'all') {
      query = query.eq('room_type_id', variables.roomTypeId);
    }
    if (variables.sharingTypeId && variables.sharingTypeId !== 'all') {
      query = query.eq('sharing_type_id', variables.sharingTypeId);
    }
    
    const response = await query;
    return unwrapSupabaseResponse(response) as RoomBasic[];
  },
});

/** Fetch available seats for a room (dropdown) */
export const useAvailableSeats = createQuery<SeatBasic[], { roomId: string }>({
  queryKey: ['seats'],
  fetcher: async (variables) => {
    const response = await supabase
      .from('seats')
      .select('id, seat_number')
      .eq('room_id', variables.roomId)
      .eq('status', 'AVAILABLE');
    return unwrapSupabaseResponse(response) as SeatBasic[];
  },
});

// ─── Mutations ────────────────────────────────────────────────────────────

interface AddFloorVariables {
  buildingId: string;
  floorNumber: string;
}

export const useAddFloor = createMutation<void, AddFloorVariables>({
  mutationFn: async (variables) => {
    const response = await supabase.from('floors').insert({
      building_id: variables.buildingId,
      floor_number: variables.floorNumber,
    });
    unwrapSupabaseResponse(response);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: layoutKeys.all });
  },
});

interface AddRoomVariables {
  floorId: string;
  roomNumber: string;
  totalSeats: number;
}

export const useAddRoom = createMutation<void, AddRoomVariables>({
  mutationFn: async (variables) => {
    const roomResp = await supabase.from('rooms').insert({
      floor_id: variables.floorId,
      room_number: variables.roomNumber,
      total_seats: variables.totalSeats,
    }).select('id').single();
    const room = unwrapSupabaseResponse(roomResp);

    // Auto-create seats
    const seats = Array.from({ length: variables.totalSeats }).map((_, i) => ({
      room_id: room.id,
      seat_number: `B${i + 1}`,
    }));
    await supabase.from('seats').insert(seats);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: layoutKeys.all });
  },
});
