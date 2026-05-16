import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { auth } from "../lib/firebase";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { 
  User, Bell, Shield, Wallet, 
  Moon, Globe, HelpCircle, Save 
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const user = auth.currentUser;
  const [notifications, setNotifications] = useState(true);
  const [autoExport, setAutoExport] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBFA]">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Settings</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your workspace and account preferences.</p>
        </header>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="col-span-2 space-y-8">
            <Card className="border-none shadow-sm shadow-slate-100 rounded-3xl p-8 bg-white">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <User className="text-amber-600 w-8 h-8" />
                    )}
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-gray-900">{user?.displayName || "Research User"}</h2>
                    <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
                 </div>
                 <Button variant="outline" className="ml-auto rounded-xl h-10 border-slate-100 font-bold text-xs">
                    Change Identity
                 </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                    <Input defaultValue={user?.displayName || ""} className="h-12 rounded-2xl border-slate-100 bg-slate-50 border-none shadow-none focus:ring-amber-500 font-medium" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Contact Email</label>
                    <Input defaultValue={user?.email || ""} className="h-12 rounded-2xl border-slate-100 bg-slate-50 border-none shadow-none font-medium opacity-50" disabled />
                 </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm shadow-slate-100 rounded-3xl p-8 bg-white">
              <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                       <Bell size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Push Notifications</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Get alerts when analysis completes</p>
                    </div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                       <Shield size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Automatic PDF Export</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Store copies on completion</p>
                    </div>
                  </div>
                  <Switch checked={autoExport} onCheckedChange={setAutoExport} />
                </div>
              </div>
            </Card>

            <div className="flex justify-end pt-4">
               <Button onClick={handleSave} className="bg-[#F59E0B] text-white px-8 h-12 rounded-2xl font-bold shadow-md shadow-amber-100 hover:bg-[#D97706] transition-all flex items-center gap-2">
                  <Save size={18} />
                  Save Workspace Changes
               </Button>
            </div>
          </div>

          {/* Sidebar Settings Info */}
          <div className="space-y-6">
             <Card className="border-none shadow-sm shadow-slate-100 rounded-3xl p-6 bg-white">
                <h4 className="font-bold text-amber-600 text-xs uppercase tracking-widest mb-4">Account Status</h4>
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                   <Wallet className="text-amber-600" size={20} />
                   <div>
                      <p className="text-sm font-bold text-amber-900">Pro Plan</p>
                      <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">Active Membership</p>
                   </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Security</p>
                   <Button variant="ghost" className="w-full justify-start rounded-xl h-10 text-slate-600 font-semibold text-xs transition-colors hover:bg-slate-50">
                      <Shield size={14} className="mr-2" /> 2FA Setup
                   </Button>
                   <Button variant="ghost" className="w-full justify-start rounded-xl h-10 text-slate-600 font-semibold text-xs transition-colors hover:bg-slate-50">
                      <Moon size={14} className="mr-2" /> Appearance
                   </Button>
                   <Button variant="ghost" className="w-full justify-start rounded-xl h-10 text-slate-600 font-semibold text-xs transition-colors hover:bg-slate-50">
                      <Globe size={14} className="mr-2" /> Localization
                   </Button>
                </div>
             </Card>

             <Card className="border-none shadow-sm shadow-slate-100 rounded-3xl p-6 bg-slate-900 text-white">
                <HelpCircle className="text-amber-500 mb-4" size={24} />
                <h4 className="font-bold text-lg mb-1 tracking-tight">Need help?</h4>
                <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">Our AI experts are available 24/7 to help you optimize your meeting extracts.</p>
                <Button className="w-full bg-white text-slate-900 rounded-xl h-10 font-bold text-xs hover:bg-slate-100">
                   Contact Support
                </Button>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
