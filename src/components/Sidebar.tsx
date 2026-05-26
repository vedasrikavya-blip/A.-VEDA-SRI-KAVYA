import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, History, Zap, Settings, LogOut, 
  ChevronRight, BrainCircuit, Terminal, Mail
} from "lucide-react";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { motion } from "motion/react";

function SidebarItem({ 
  icon, 
  label, 
  to 
}: { 
  icon: ReactNode; 
  label: string; 
  to: string;
}) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className="block group mb-1">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 font-pixel text-sm uppercase tracking-widest ${
        active 
          ? "bg-cyan-400 text-black shadow-[4px_4px_0px_#FF00FF]" 
          : "text-zinc-500 hover:text-cyan-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
      }`}>
        <div className={`${active ? "text-black" : "text-zinc-700 group-hover:text-cyan-400"} transition-colors`}>
          {icon}
        </div>
        <span>{label}</span>
      </div>
    </Link>
  );
}

export function Sidebar({ docCount = 0 }: { docCount?: number }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Connection Terminated Successfully");
    } catch (error) {
      toast.error("Process Termination Failed");
    }
  };

  return (
    <aside className="w-64 bg-black border-r-2 border-zinc-900 flex flex-col p-6 sticky top-0 h-screen flex-shrink-0 z-40 overflow-hidden">
      <div className="flex items-center gap-3 mb-12 group">
        <div className="w-10 h-10 border-2 border-cyan-400 bg-black flex items-center justify-center shadow-[3px_3px_0px_#FF00FF] group-hover:rotate-12 transition-transform">
          <BrainCircuit className="w-6 h-6 text-cyan-400" />
        </div>
        <span className="font-pixel text-xl tracking-tighter text-cyan-400 uppercase glitch-text">NoteGenius</span>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] mb-4 px-4">Directory_Map</div>
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Command" to="/dashboard" />
        <SidebarItem icon={<History size={18} />} label="Archive" to="/history" />
        <SidebarItem icon={<Mail size={18} />} label="Transmissions" to="/transmissions" />
        <SidebarItem icon={<Zap size={18} />} label="Telemetry" to="/insights" />
        <SidebarItem icon={<Settings size={18} />} label="CONFIG" to="/settings" />
      </nav>

      <div className="mt-auto">
        <div className="bg-zinc-950 rounded-none p-5 border-2 border-zinc-900 mb-8 relative overflow-hidden group shadow-[4px_4px_0px_#000]">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Terminal size={40} />
          </div>
          <p className="text-[9px] font-black text-magenta-500 mb-2 leading-none uppercase tracking-widest">Protocol: Active</p>
          <p className="text-[10px] text-zinc-600 mb-4 font-mono uppercase tracking-tight">Sync_Load: {docCount}/50_Nodes</p>
          <div className="w-full bg-zinc-900 h-1 rounded-none mb-6">
            <div 
              className="bg-cyan-400 h-1 transition-all duration-1000 shadow-[0_0_8px_rgba(0,255,255,0.5)]" 
              style={{ width: `${Math.min((docCount / 50) * 100, 100)}%` }} 
            />
          </div>
          <button className="w-full py-2.5 bg-transparent text-cyan-400 text-[10px] font-pixel tracking-widest uppercase border-2 border-cyan-400 shadow-[2px_2px_0px_#FF00FF] hover:bg-cyan-400 hover:text-black transition-all">
            Expand_Capacity
          </button>
        </div>
        
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-zinc-700 hover:text-magenta-500 hover:bg-zinc-950 border border-transparent hover:border-zinc-900 rounded-none transition-all font-pixel text-xs uppercase tracking-widest group"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          <span>Terminate</span>
        </button>
      </div>
    </aside>
  );
}
