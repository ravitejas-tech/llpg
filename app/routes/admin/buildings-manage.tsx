import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Building2, Plus, ArrowLeft, Layers, Hash, Bed, Trash2, Pencil, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
import { supabase } from '~/lib/supabase';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '~/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '~/components/ui/label';

export default function ManageBuildingLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<any>(null);
  const [floors, setFloors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFloor, setOpenFloor] = useState(false);
  const [openRoom, setOpenRoom] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  
  // Form States
  const [newFloorNum, setNewFloorNum] = useState('');
  const [newRoomNum, setNewRoomNum] = useState('');
  const [seatsInRoom, setSeatsInRoom] = useState('4');

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [bRes, fRes] = await Promise.all([
        supabase.from('buildings').select('*, address:addresses(*, city:cities(name))').eq('id', id).single(),
        supabase.from('floors').select('*, rooms(*, seats(*))').eq('building_id', id).order('floor_number', { ascending: true })
      ]);
      
      if (bRes.data) setBuilding(bRes.data);
      if (fRes.data) setFloors(fRes.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load building layout");
    } finally {
      setLoading(false);
    }
  }

  const addFloor = async () => {
    if (!newFloorNum) return;
    try {
      const { error } = await supabase.from('floors').insert({
        building_id: id,
        floor_number: newFloorNum
      });
      if (error) throw error;
      toast.success("Floor added!");
      setOpenFloor(false);
      setNewFloorNum('');
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const addRoom = async () => {
    if (!newRoomNum || !selectedFloor) return;
    try {
      const { data: room, error: re } = await supabase.from('rooms').insert({
        floor_id: selectedFloor,
        room_number: newRoomNum,
        total_seats: Number(seatsInRoom)
      }).select('id').single();
      
      if (re) throw re;

      // Auto-create seats
      const seats = Array.from({ length: Number(seatsInRoom) }).map((_, i) => ({
        room_id: room.id,
        seat_number: `B${i+1}`
      }));
      await supabase.from('seats').insert(seats);

      toast.success("Room and seats added!");
      setOpenRoom(false);
      setNewRoomNum('');
      loadData();
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
                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                               <Hash className="w-3.5 h-3.5 text-blue-500" />
                             </div>
                             <CardTitle className="text-base font-bold">Room {room.room_number}</CardTitle>
                           </div>
                           <Badge variant="info" className="text-[10px] uppercase font-bold px-1.5 h-5">{room.seats?.length} Seats</Badge>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                           <div className="flex flex-wrap gap-2 mt-4">
                              {room.seats?.map((seat: any) => (
                                <div 
                                  key={seat.id} 
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${seat.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' : 'bg-red-50 text-red-500 border border-red-100 opacity-60'}`}
                                  title={seat.seat_number}
                                >
                                  <Bed className="w-5 h-5" />
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
            <div className="space-y-2">
              <Label>Number of Seats (Beds)</Label>
              <Input type="number" value={seatsInRoom} onChange={e => setSeatsInRoom(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenRoom(false)}>Cancel</Button>
            <Button onClick={addRoom}>Create Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
