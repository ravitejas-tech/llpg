import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Building2, Plus, ArrowLeft, Layers, Hash, Bed, Pencil } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '~/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '~/components/ui/label';

import { 
  useBuildingById, 
  useBuildingLayout, 
  useAddFloor, 
  useAddRoom,
  useUpdateRoom,
  useUpdateBed,
  useDeleteBed
} from '~/queries/buildings.query';
import { useRoomTypes, useSharingTypes } from '~/queries/room-types.query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

export default function ManageBuildingLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [openFloor, setOpenFloor] = useState(false);
  const [openRoom, setOpenRoom] = useState(false);
  const [openEditRoom, setOpenEditRoom] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [openEditBed, setOpenEditBed] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [newBedNum, setNewBedNum] = useState('');
  
  // Form States
  const [newFloorNum, setNewFloorNum] = useState('');
  const [newRoomNum, setNewRoomNum] = useState('');
  const [seatsInRoom, setSeatsInRoom] = useState('4');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedSharingType, setSelectedSharingType] = useState<string>('');

  // Queries
  const { data: building, isLoading: loadingBuilding } = useBuildingById({
    variables: { buildingId: id || '' },
    enabled: !!id,
  });

  const { data: floors = [], isLoading: loadingFloors } = useBuildingLayout({
    variables: { buildingId: id || '' },
    enabled: !!id,
  });

  const { data: roomTypes = [] } = useRoomTypes();
  const { data: sharingTypes = [] } = useSharingTypes();

  const loading = loadingBuilding || loadingFloors;

  // Mutations
  const { mutateAsync: addFloorMutation } = useAddFloor();
  const { mutateAsync: addRoomMutation } = useAddRoom();
  const { mutateAsync: updateRoomMutation } = useUpdateRoom();
  const { mutateAsync: updateBedMutation } = useUpdateBed();
  const { mutateAsync: deleteBedMutation } = useDeleteBed();

  const addFloor = async () => {
    if (!newFloorNum || !id) return;
    try {
      await addFloorMutation({
        buildingId: id,
        floorNumber: newFloorNum,
      });
      toast.success("Floor added!");
      setOpenFloor(false);
      setNewFloorNum('');
    } catch (e: any) {
      toast.error(e.message || "Failed to add floor");
    }
  };

  const addRoom = async () => {
    if (!newRoomNum || !selectedFloor) return;
    try {
      await addRoomMutation({
        floorId: selectedFloor,
        roomNumber: newRoomNum,
        totalSeats: Number(seatsInRoom),
        roomTypeId: selectedRoomType || undefined,
        sharingTypeId: selectedSharingType || undefined,
      });

      toast.success("Room and seats added!");
      setOpenRoom(false);
      setNewRoomNum('');
      setSelectedRoomType('');
      setSelectedSharingType('');
    } catch (e: any) {
      toast.error(e.message || "Failed to add room");
    }
  };

  const handleEditRoomSubmit = async () => {
    if (!selectedRoomId) return;
    try {
      await updateRoomMutation({
        roomId: selectedRoomId,
        roomNumber: newRoomNum,
        roomTypeId: selectedRoomType || undefined,
        sharingTypeId: selectedSharingType || undefined,
      });
      toast.success("Room updated successfully!");
      setOpenEditRoom(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to edit room");
    }
  };

  const openAppEditRoom = (room: any) => {
    setSelectedRoomId(room.id);
    setNewRoomNum(room.room_number);
    setSelectedRoomType(room.room_type_id || '');
    setSelectedSharingType(room.sharing_type_id || '');
    setSeatsInRoom(String(room.total_seats || 4));
    setOpenEditRoom(true);
  };

  const openEditBedModal = (bed: any) => {
    setSelectedBed(bed);
    setNewBedNum(bed.seat_number);
    setOpenEditBed(true);
  };

  const handleEditBed = async () => {
    if (!selectedBed) return;
    try {
      await updateBedMutation({ id: selectedBed.id, seat_number: newBedNum });
      toast.success("Bed number updated!");
      setOpenEditBed(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteBed = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bed?")) return;
    try {
      await deleteBedMutation(id);
      toast.success("Bed deleted!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400">Loading Layout...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              {building?.name}
            </h1>
            <p className="text-slate-500 text-sm">{building?.address?.line_one}, {building?.address?.city?.name}</p>
          </div>
        </div>
        
        <Dialog open={openFloor} onOpenChange={setOpenFloor}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Add New Floor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add Floor</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4 text-left">
              <div className="space-y-2">
                <Label>Floor Label (e.g. 1st Floor, Ground)</Label>
                <Input value={newFloorNum} onChange={e => setNewFloorNum(e.target.value)} placeholder="Floor 1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenFloor(false)}>Cancel</Button>
              <Button onClick={addFloor}>Save Floor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Floors Mapping */}
      <div className="grid gap-6">
        {floors.map((floor, fIdx) => (
          <div key={floor.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:border-blue-200">
             <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-emerald-600" />
                   </div>
                   <h3 className="font-bold text-slate-900 text-lg">{floor.floor_number}</h3>
                   <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                      {floor.rooms?.length || 0} Rooms
                   </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => { setSelectedFloor(floor.id); setOpenRoom(true); }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Room
                </Button>
             </div>
             
             <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {floor.rooms?.map((room: any) => (
                     <Card key={room.id} className="border-slate-100 hover:shadow-md transition-shadow">
                        <CardHeader className="p-4 pb-2 flex flex-col justify-between space-y-2">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                                 <Hash className="w-3.5 h-3.5 text-blue-500" />
                               </div>
                               <CardTitle className="text-base font-bold">Room {room.room_number}</CardTitle>
                             </div>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openAppEditRoom(room)}>
                               <Pencil className="w-3.5 h-3.5" />
                             </Button>
                           </div>
                           <div className="flex flex-wrap gap-1.5 mt-2">
                             <Badge variant="info" className="text-[10px] uppercase font-bold px-1.5 h-5">{room.seats?.length} Seats</Badge>
                             {room.room_types && <Badge variant="secondary" className="text-[10px] uppercase h-5 text-slate-500 bg-white border-slate-200">{room.room_types.name}</Badge>}
                             {room.sharing_types && <Badge variant="secondary" className="text-[10px] uppercase h-5 text-slate-500 bg-white border-slate-200">{room.sharing_types.name}</Badge>}
                           </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                               <div className="flex flex-wrap gap-3 mt-4">
                                  {room.seats?.map((seat: any) => (
                                    <div key={seat.id} className="flex flex-col items-center gap-1 group relative">
                                      <div 
                                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${seat.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}
                                        onClick={() => openEditBedModal(seat)}
                                      >
                                        <Bed className="w-5 h-5 mb-0.5" />
                                        <span className="text-[9px] font-bold uppercase">{seat.seat_number}</span>
                                      </div>
                                      {seat.status === 'AVAILABLE' && (
                                        <button 
                                          onClick={() => handleDeleteBed(seat.id)}
                                          className="absolute -top-1 -right-1 bg-white border border-slate-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                        >
                                          <Plus className="w-2.5 h-2.5 rotate-45" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  {(!room.seats || room.seats.length === 0) && (
                                    <div className="text-[10px] text-slate-400 italic">No seats added.</div>
                                  )}
                               </div>
                        </CardContent>
                     </Card>
                   ))}
                   
                   {(!floor.rooms || floor.rooms.length === 0) && (
                     <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                        No rooms in this floor. Click "Add Room" to start.
                     </div>
                   )}
                </div>
             </div>
          </div>
        ))}

        {floors.length === 0 && (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
             <div className="w-16 h-16 rounded-3xl bg-slate-50 mx-auto flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900">No Floors Defined</h3>
             <p className="text-slate-500 mt-1 max-w-xs mx-auto">Structure your building by adding floors and then rooms within them.</p>
             <Button className="mt-6" onClick={() => setOpenFloor(true)}>Create Your First Floor</Button>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      <Dialog open={openRoom} onOpenChange={setOpenRoom}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Room to Floor</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-left">
            <div className="space-y-2">
              <Label>Room Number / Name</Label>
              <Input value={newRoomNum} onChange={e => setNewRoomNum(e.target.value)} placeholder="e.g. 101, A1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger><SelectValue placeholder="Non-AC, AC..." /></SelectTrigger>
                  <SelectContent>
                    {roomTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sharing Type</Label>
                <Select value={selectedSharingType} onValueChange={(v) => {
                  setSelectedSharingType(v);
                  const st = sharingTypes.find(s => s.id === v);
                  if (st) setSeatsInRoom(String(st.capacity));
                }}>
                  <SelectTrigger><SelectValue placeholder="Single, Double..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Custom / None</SelectItem>
                    {sharingTypes.map(st => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Number of Seats (Beds)</Label>
              <Input 
                type="number" 
                value={seatsInRoom} 
                onChange={e => setSeatsInRoom(e.target.value)} 
                disabled={selectedSharingType !== '' && selectedSharingType !== 'none'}
              />
              {(selectedSharingType !== '' && selectedSharingType !== 'none') && (
                <p className="text-[10px] text-blue-500 italic">Locked to {sharingTypes.find(s => s.id === selectedSharingType)?.name} capacity</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRoom(false)}>Cancel</Button>
            <Button onClick={addRoom}>Create Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Modal */}
      <Dialog open={openEditRoom} onOpenChange={setOpenEditRoom}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Room Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-left">
            <div className="space-y-2">
              <Label>Room Number / Name</Label>
              <Input value={newRoomNum} onChange={e => setNewRoomNum(e.target.value)} placeholder="e.g. 101, A1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Type</Label>
                <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                  <SelectTrigger><SelectValue placeholder="Non-AC, AC..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {roomTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sharing Type</Label>
                <Select value={selectedSharingType} onValueChange={setSelectedSharingType}>
                  <SelectTrigger><SelectValue placeholder="Single, Double..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {sharingTypes.map(st => <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditRoom(false)}>Cancel</Button>
            <Button onClick={handleEditRoomSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bed Modal */}
      <Dialog open={openEditBed} onOpenChange={setOpenEditBed}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Bed Number</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-left">
            <div className="space-y-2">
              <Label>Bed Label (e.g. B1, Bed A)</Label>
              <Input value={newBedNum} onChange={e => setNewBedNum(e.target.value)} placeholder="B1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEditBed(false)}>Cancel</Button>
            <Button onClick={handleEditBed}>Update Bed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
