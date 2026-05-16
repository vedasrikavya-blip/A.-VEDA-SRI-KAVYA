import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, History, Zap, Settings, LogOut, 
  ChevronRight, BrainCircuit 
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
    <Link to={to} className="block group">
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm ${
        active 
          ? "bg-amber-50 text-amber-700 shadow-sm shadow-amber-100" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`}>
        <div className={`${active ? "text-amber-500" : "text-gray-400 group-hover:text-gray-600"} transition-colors`}>
          {icon}
        </div>
        <span>{label}</span>
        {active && (
          <motion.div 
            layoutId="sidebar-active"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500"
          />
        )}
      </div>
    </Link>
  );
}

export function Sidebar({ docCount = 0 }: { docCount?: number }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-6 sticky top-0 h-screen flex-shrink-0">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">NoteGenius</span>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-3">Navigation</div>
        <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/dashboard" />
        <SidebarItem icon={<History size={18} />} label="History" to="/history" />
        <SidebarItem icon={<Zap size={18} />} label="Insights" to="/insights" />
        <SidebarItem icon={<Settings size={18} />} label="Settings" to="/settings" />
      </nav>

      <div className="mt-auto">
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-6">
          <p className="text-xs font-bold text-amber-800 mb-1 leading-none">Pro Plan</p>
          <p className="text-[10px] text-amber-600 mb-3 font-medium">{docCount} of 50 documents used</p>
          <div className="w-full bg-amber-200 h-1.5 rounded-full mb-4">
            <div 
              className="bg-[#F59E0B] h-1.5 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min((docCount / 50) * 100, 100)}%` }} 
            />
          </div>
          <button className="w-full py-2 bg-white text-amber-800 text-[11px] font-bold border border-amber-200 rounded-xl shadow-sm hover:bg-amber-50 transition-colors">
            Upgrade Workspace
          </button>
        </div>
        
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm group"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
