import { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Sidebar } from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  Mail, Send, Search, ExternalLink, 
  Terminal, Clock, User, Check, Copy
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export default function Transmissions() {
  const [transmissions, setTransmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, "meetings"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Filter for those that have a follow-up email
      setTransmissions(docs.filter(d => d.followUpEmail));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "meetings");
    });
  }, []);

  const filtered = transmissions.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.followUpEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-black font-sans text-cyan-400">
      <div className="crt-scanline"></div>
      <Sidebar docCount={transmissions.length} />
      
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="mb-12">
          <h1 className="text-3xl font-pixel uppercase tracking-widest text-white glitch-text mb-3">Transmission_Logs</h1>
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">Manage and dispatch generated follow-up protocols.</p>
        </header>

        <div className="mb-10 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
          <input 
            placeholder="FILTER_TRANSMISSIONS_BY_TITLE_OR_CONTENT..." 
            className="w-full pl-12 h-14 bg-black border-2 border-zinc-900 rounded-none focus:border-magenta-500 font-mono text-magenta-500 placeholder:text-zinc-900 shadow-[4px_4px_0px_#111] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((transmission, index) => (
              <TransmissionItem key={transmission.id} transmission={transmission} index={index} />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-24 bg-zinc-950 border-2 border-dashed border-zinc-900">
              <div className="inline-flex items-center justify-center w-20 h-20 border border-zinc-900 bg-black mb-6 text-zinc-800">
                <Mail className="w-8 h-8" />
              </div>
              <p className="text-zinc-600 font-pixel text-xl uppercase tracking-widest">ZERO_DRAFTS_DETECTED</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TransmissionItem({ transmission, index }: { transmission: any, index: number }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transmission.followUpEmail);
    setIsCopied(true);
    toast.success("Binary Content Copied");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="rounded-none border-2 border-zinc-900 bg-zinc-950 p-1 shadow-[8px_8px_0px_#000] overflow-hidden group hover:border-cyan-400/50 transition-all">
        <CardHeader className="bg-black border-b border-zinc-900 p-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-magenta-500 bg-black flex items-center justify-center text-magenta-500 shadow-[2px_2px_0px_#00FFFF] group-hover:rotate-6 transition-transform">
              <Mail size={18} />
            </div>
            <div>
              <CardTitle className="text-lg font-pixel uppercase tracking-widest text-white">{transmission.title}</CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[8px] font-mono text-zinc-700 uppercase">NODE: {transmission.id.slice(0, 8)}</span>
                <span className="text-[8px] font-mono text-zinc-700 uppercase">FREQ: {format(new Date(transmission.createdAt), 'yyyy.MM.dd')}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/meeting/${transmission.id}`}>
              <Button variant="ghost" size="icon" className="rounded-none border border-zinc-900 text-zinc-600 hover:text-cyan-400 hover:border-cyan-400 hover:bg-black">
                <ExternalLink size={16} />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-black">
          <div className="relative">
             <div className="bg-zinc-950/50 border border-zinc-900 p-8 text-[11px] font-mono text-zinc-500 leading-relaxed max-h-40 overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
               "{transmission.followUpEmail}"
             </div>
             <div className="flex items-center gap-4 mt-6">
                <Button 
                  onClick={handleCopy}
                  variant="outline" 
                  className="flex-1 rounded-none border-2 border-zinc-900 bg-transparent text-zinc-700 hover:text-white hover:border-zinc-700 font-pixel text-[10px] uppercase tracking-widest h-12 gap-2"
                >
                  {isCopied ? <Check size={14} className="text-cyan-400" /> : <Copy size={14} />}
                  {isCopied ? "CAPTURED" : "COPY_PAYLOAD"}
                </Button>
                <Link to={`/meeting/${transmission.id}`} className="flex-1">
                  <Button className="w-full rounded-none bg-magenta-500 text-white font-pixel text-[10px] uppercase tracking-widest h-12 shadow-[4px_4px_0px_#00FFFF] hover:bg-magenta-600 transition-all flex items-center gap-2">
                    <Send size={14} />
                    INITIALIZE_DISPATCH
                  </Button>
                </Link>
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
