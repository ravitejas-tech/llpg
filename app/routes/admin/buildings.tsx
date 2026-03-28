import { useState } from 'react';
import { Building2, Plus, MapPin, Layers, Settings2, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { useAuthStore } from '~/store/auth.store';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '~/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '~/components/ui/label';

// Query hooks
import { 
  useAdminBuildings, 
  useCities, 
  useAddBuilding, 
  useUpdateBuildingSettings 
} from '~/queries/buildings.query';

export default function BuildingsPage() {
  const { user } = useAuthStore();
  
  // Queries
  const { data: buildings = [], isLoading: loadingBuildings } = useAdminBuildings({
    variables: { adminId: user?.id || '' },
    enabled: !!user?.id,
  });
  
  const { data: cities = [] } = useCities();

  // Mutations
  const { mutateAsync: addBuilding, isPending: addingBuilding } = useAddBuilding();
  const { mutateAsync: updateSettings, isPending: updatingSettings } = useUpdateBuildingSettings();

  const [openAdd, setOpenAdd] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [selectedBldg, setSelectedBldg] = useState<any>(null);

  // Add Building States
  const [newBldg, setNewBldg] = useState({ name: '', line_one: '', city_id: '', floors: '1', rooms_per_floor: '4' });
  const [setts, setSetts] = useState({ monthly_rent: '', daily_rent: '', deposit_amount: '' });

  const onAddBuilding = async () => {
    try {
      if (!newBldg.city_id || !newBldg.name) return toast.error("Please fill required fields");
      
      await addBuilding({
        name: newBldg.name,
        line_one: newBldg.line_one,
        city_id: newBldg.city_id,
        admin_id: user!.id,
        floors: Number(newBldg.floors),
        rooms_per_floor: Number(newBldg.rooms_per_floor),
      });

      toast.success("Building created!");
      setOpenAdd(false);
      setNewBldg({ name: '', line_one: '', city_id: '', floors: '1', rooms_per_floor: '4' });
    } catch (e: any) {
      toast.error(e.message || "Failed to create building");
    }
  };

  const handleOpenSettings = (b: any) => {
    setSelectedBldg(b);
    setSetts({
      monthly_rent: (b.monthly_rent || 0).toString(),
      daily_rent: (b.daily_rent || 0).toString(),
      deposit_amount: (b.deposit_amount || 0).toString()
    });
    setOpenSettings(true);
  };

  const onSettingsSubmit = async () => {
    if (!selectedBldg) return;
    try {
      await updateSettings({
        buildingId: selectedBldg.id,
        monthly_rent: Number(setts.monthly_rent),
        daily_rent: Number(setts.daily_rent),
        deposit_amount: Number(setts.deposit_amount)
      });
      toast.success("Settings updated!");
      setOpenSettings(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to update settings");
    }
  };

  if (loadingBuildings) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading properties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Your Properties
          </h1>
          <p className="text-slate-500 mt-1">Manage buildings, rooms and rental preferences</p>
        </div>
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
           <DialogTrigger asChild>
             <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-blue-500/20">
               <Plus className="w-4 h-4 mr-2" /> Add Building
             </Button>
           </DialogTrigger>
           <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add New Building</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4 text-left">
                 <div className="space-y-2">
                   <Label>Building Name *</Label>
                   <Input value={newBldg.name} onChange={e => setNewBldg({...newBldg, name: e.target.value})} placeholder="e.g. Royal PG" />
                 </div>
                 <div className="space-y-2">
                   <Label>City *</Label>
                   <select className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm" value={newBldg.city_id} onChange={e => setNewBldg({...newBldg, city_id: e.target.value})}>
                     <option value="">Select City</option>
                     {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <Label>Full Address</Label>
                   <Input value={newBldg.line_one} onChange={e => setNewBldg({...newBldg, line_one: e.target.value})} placeholder="Area, Landmark" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Floors</Label>
                      <Input type="number" value={newBldg.floors} onChange={e => setNewBldg({...newBldg, floors: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Rooms per Floor</Label>
                      <Input type="number" value={newBldg.rooms_per_floor} onChange={e => setNewBldg({...newBldg, rooms_per_floor: e.target.value})} />
                    </div>
                 </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAdd(false)} disabled={addingBuilding}>Cancel</Button>
                <Button onClick={onAddBuilding} disabled={addingBuilding}>{addingBuilding ? 'Creating...' : 'Create Property'}</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buildings.map(b => (
          <Card key={b.id} className="border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
             <div className="h-2 bg-blue-600" />
             <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <Badge variant={b.status === 'ACTIVE' ? 'success' : 'secondary'}>{b.status}</Badge>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{b.name}</h3>
                <p className="text-xs text-slate-500 flex items-center mb-4 truncate"><MapPin className="w-3 h-3 mr-1" /> {b.address?.line_one}, {b.address?.city?.name}</p>
                
                <div className="flex gap-2">
                  <Link to={`/admin/buildings/${b.id}/layout`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Layers className="w-3.5 h-3.5 mr-2" /> Layout
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenSettings(b)}>
                    <Settings2 className="w-3.5 h-3.5 mr-2" /> Settings
                  </Button>
                </div>
             </CardContent>
          </Card>
        ))}
        {buildings.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p>No buildings found.</p>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Property Settings: {selectedBldg?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-left font-medium">
             <div className="space-y-2">
               <Label>Monthly Rent (₹)</Label>
               <Input value={setts.monthly_rent} onChange={e => setSetts({...setts, monthly_rent: e.target.value})} type="number" />
             </div>
             <div className="space-y-2">
               <Label>Daily Rent (₹)</Label>
               <Input value={setts.daily_rent} onChange={e => setSetts({...setts, daily_rent: e.target.value})} type="number" />
             </div>
             <div className="space-y-2">
               <Label>Security Deposit (₹)</Label>
               <Input value={setts.deposit_amount} onChange={e => setSetts({...setts, deposit_amount: e.target.value})} type="number" />
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setOpenSettings(false)} disabled={updatingSettings}>Cancel</Button>
             <Button onClick={onSettingsSubmit} disabled={updatingSettings}>{updatingSettings ? 'Saving...' : 'Save Settings'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
