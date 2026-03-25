import { Settings2, UserCog, Building2, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAuthStore } from '~/store/auth.store';

export default function AdminSettings() {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-slate-600" />
            Admin Settings
          </h1>
          <p className="text-slate-500 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-blue-500"/> Personal Profile</CardTitle>
           <CardDescription>Update your contact info and personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid sm:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Full Name</Label>
               <Input value={user?.name || ''} readOnly className="bg-slate-50 text-slate-500" />
             </div>
             <div className="space-y-2">
               <Label>Email Address</Label>
               <Input value={user?.email || ''} readOnly className="bg-slate-50 text-slate-500" />
             </div>
             <div className="space-y-2">
               <Label>Role Level</Label>
               <Input value={user?.role || ''} readOnly className="bg-slate-50 font-bold" />
             </div>
           </div>
           <Button className="mt-4" disabled>Update Profile</Button> 
           <p className="text-xs text-slate-400 mt-2">Currently, profile updates must be processed through Super Admin.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500"/> Preferences</CardTitle>
           <CardDescription>Customize your notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50">
             <div>
               <p className="font-semibold text-slate-900">Email Notifications</p>
               <p className="text-sm text-slate-500">Receive alerts when new residents register</p>
             </div>
             <Button variant="outline" size="sm">Enabled</Button>
           </div>
           
           <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50">
             <div>
               <p className="font-semibold text-slate-900">SMS Alerts</p>
               <p className="text-sm text-slate-500">Get text messages for delayed payments</p>
             </div>
             <Button variant="outline" size="sm">Disabled</Button>
           </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-500"/> System Setup</CardTitle>
        </CardHeader>
        <CardContent>
           <p className="text-slate-500 py-4">To modify building allocation boundaries or create new facilities, please contact the Super Admin team.</p>
        </CardContent>
      </Card>
    </div>
  );
}
