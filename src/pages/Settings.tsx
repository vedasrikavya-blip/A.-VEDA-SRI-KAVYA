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
    <div className="flex min-h-screen bg-black font-sans text-cyan-400">
      <div className="crt-scanline"></div>
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="mb-12">
          <h1 className="text-3xl font-pixel uppercase tracking-widest text-white glitch-text mb-3">System_Config</h1>
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">Manage node preferences and identity authentication.</p>
        </header>

        <div className="grid grid-cols-3 gap-10">
          {/* Main Settings */}
          <div className="col-span-2 space-y-10">
            <Card className="rounded-none border-2 border-zinc-900 bg-zinc-950 p-8 shadow-[10px_10px_0px_#000]">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-20 h-20 border-2 border-cyan-400 bg-black flex items-center justify-center shadow-[4px_4px_0px_#FF00FF]">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-cyan-400 w-10 h-10" />
                    )}
                 </div>
                 <div>
                    <h2 className="text-2xl font-pixel text-white uppercase tracking-widest">{user?.displayName || "Research_Node_01"}</h2>
                    <p className="text-xs font-mono text-zinc-500 uppercase mt-1">[{user?.email}]</p>
                 </div>
                 <Button variant="outline" className="ml-auto rounded-none border-2 border-zinc-900 bg-transparent text-zinc-500 hover:text-cyan-400 hover:border-cyan-400 font-pixel text-[10px] uppercase h-10 px-4">
                    REAUTH_IDENTITY
                 </Button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] px-1">OPERATOR_ALIAS</label>
                    <Input defaultValue={user?.displayName || ""} className="rounded-none h-14 border-2 border-zinc-900 bg-black focus:border-cyan-400 text-cyan-400 font-mono placeholder:text-zinc-900" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] px-1">COMM_CHANNEL</label>
                    <Input defaultValue={user?.email || ""} className="rounded-none h-14 border-2 border-zinc-900 bg-zinc-950 text-zinc-700 font-mono opacity-50" disabled />
                 </div>
              </div>
            </Card>

            <Card className="rounded-none border-2 border-zinc-900 bg-zinc-950 p-8 shadow-[10px_10px_0px_#000]">
              <h3 className="text-xl font-pixel text-white uppercase tracking-widest mb-10">Protocol_Directives</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-black border border-zinc-900">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 border border-zinc-900 flex items-center justify-center text-zinc-500">
                       <Bell size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-pixel text-white uppercase tracking-widest">Neural_Alerts</p>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter mt-1">Notify on synthesis completion</p>
                    </div>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} className="data-[state=checked]:bg-cyan-400" />
                </div>

                <div className="flex items-center justify-between p-6 bg-black border border-zinc-900">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 border border-zinc-900 flex items-center justify-center text-zinc-500">
                       <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-pixel text-white uppercase tracking-widest">Auto_Cipher_Export</p>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter mt-1">Archive PDF copies on finalization</p>
                    </div>
                  </div>
                  <Switch checked={autoExport} onCheckedChange={setAutoExport} className="data-[state=checked]:bg-magenta-500" />
                </div>
              </div>
            </Card>

            <div className="flex justify-end pt-4">
               <Button onClick={handleSave} className="bg-magenta-500 text-white px-10 h-16 rounded-none font-pixel text-lg shadow-[6px_6px_0px_#00FFFF] hover:bg-magenta-600 transition-all uppercase flex items-center gap-3">
                  <Save size={24} />
                  COMMIT_SYSTEM_CHANGES
               </Button>
            </div>
          </div>

          {/* Sidebar Settings Info */}
          <div className="space-y-10">
             <Card className="rounded-none border-2 border-zinc-900 bg-zinc-950 p-8 shadow-[10px_10px_0px_#000]">
                <h4 className="font-pixel text-magenta-500 text-xs uppercase tracking-[0.2em] mb-6">Uplink_Tier</h4>
                <div className="flex items-center gap-4 p-5 bg-magenta-950/20 border border-magenta-900">
                   <Wallet className="text-magenta-500" size={24} />
                   <div>
                      <p className="text-base font-pixel text-white uppercase tracking-widest leading-none">ELITE_PROTOCOL</p>
                      <p className="text-[10px] text-magenta-600 font-mono uppercase tracking-widest mt-2">Active_Lease</p>
                   </div>
                </div>
                <div className="mt-10 pt-8 border-t border-zinc-900 font-mono">
                   <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] mb-6 px-1">SECURITY_MODULES</p>
                   <Button variant="ghost" className="w-full justify-start rounded-none h-12 text-zinc-500 font-pixel text-[10px] uppercase hover:text-cyan-400 hover:bg-black transition-colors px-4 border border-transparent hover:border-zinc-800">
                      <Shield size={14} className="mr-3" /> 2FA_SYNTAX
                   </Button>
                   <Button variant="ghost" className="w-full justify-start rounded-none h-12 text-zinc-500 font-pixel text-[10px] uppercase hover:text-cyan-400 hover:bg-black transition-colors px-4 border border-transparent hover:border-zinc-800 mt-2">
                      <Moon size={14} className="mr-3" /> SPECTRAL_THEME
                   </Button>
                   <Button variant="ghost" className="w-full justify-start rounded-none h-12 text-zinc-500 font-pixel text-[10px] uppercase hover:text-cyan-400 hover:bg-black transition-colors px-4 border border-transparent hover:border-zinc-800 mt-2">
                      <Globe size={14} className="mr-3" /> LINGUAL_ENCRYPT
                   </Button>
                </div>
             </Card>

             <Card className="rounded-none border-2 border-magenta-500 bg-black text-white p-8 shadow-[10px_10px_0px_#00FFFF] relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 text-magenta-900/10 group-hover:text-magenta-900/20 transition-colors">
                  <HelpCircle size={120} />
                </div>
                <HelpCircle className="text-cyan-400 mb-6" size={32} />
                <h4 className="font-pixel text-2xl mb-2 tracking-widest uppercase text-white">Support_Node</h4>
                <p className="text-[10px] text-zinc-500 font-mono uppercase leading-relaxed mb-10 tracking-tighter">Our synthesis experts are on standby 24/7 to optimize your conversational throughput.</p>
                <Button className="w-full bg-white text-black rounded-none h-14 font-pixel text-sm hover:bg-zinc-200 shadow-[4px_4px_0px_#FF00FF] active:shadow-none transition-all">
                   SIGNAL_HELP_DESK
                </Button>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
