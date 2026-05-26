import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { auth, db } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { 
  Search, Filter, Trash2, Download, 
  ExternalLink, Calendar, ArrowUpDown, Terminal
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function History() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "meetings"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", sortBy === "newest" ? "desc" : "asc")
    );

    return onSnapshot(q, (snapshot) => {
      setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, [sortBy]);

  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-black font-sans text-cyan-400">
      <div className="crt-scanline"></div>
      <Sidebar docCount={meetings.length} />
      
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-pixel uppercase tracking-widest text-white glitch-text mb-3">Archive_Logs</h1>
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">{meetings.length} NODES_RECOVERED_SINCE_ORIGIN</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-none h-10 border-2 border-zinc-800 bg-transparent text-zinc-500 hover:text-cyan-400 hover:border-cyan-400 font-pixel text-[10px] uppercase shadow-[3px_3px_0px_#000]">
               <Download className="w-4 h-4 mr-3" /> EXPORT_DEED
             </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-800" />
            <Input 
              placeholder="SEARCH_BINARY_STRINGS..." 
              className="pl-12 h-14 bg-black border-2 border-zinc-900 rounded-none focus:border-cyan-400 font-mono text-cyan-400 placeholder:text-zinc-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="h-14 px-8 rounded-none border-2 border-zinc-900 bg-zinc-950 shadow-[4px_4px_0px_#000] flex items-center gap-3 font-pixel text-xs text-zinc-500 hover:text-white hover:border-zinc-700 transition-all uppercase tracking-widest"
            onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
          >
            <ArrowUpDown className="w-4 h-4" />
            SORT: {sortBy.toUpperCase()}
          </Button>
          <Button variant="outline" className="h-14 w-14 p-0 rounded-none border-2 border-zinc-900 bg-black hover:border-magenta-500 hover:text-magenta-500">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* History Table/List */}
        <div className="space-y-6">
          {filteredMeetings.map((meeting, index) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={meeting.id}
            >
              <Card className="p-6 border-2 border-zinc-900 bg-zinc-950 rounded-none shadow-[6px_6px_0px_#000] hover:border-cyan-400 transition-all group flex items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                  <Terminal size={32} />
                </div>
                <div className="w-14 h-14 border-2 border-zinc-900 bg-black flex items-center justify-center flex-shrink-0 group-hover:border-magenta-500 transition-colors shadow-[2px_2px_0px_#000] group-hover:shadow-[2px_2px_0px_#FF00FF]">
                  <Calendar className="w-6 h-6 text-zinc-800 group-hover:text-magenta-500 transition-colors" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-pixel text-xl uppercase tracking-widest text-cyan-400 truncate group-hover:text-white transition-colors">{meeting.title}</h3>
                    <div className="h-0.5 flex-1 bg-zinc-900/50" />
                    <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-tighter shrink-0">
                      [{format(new Date(meeting.createdAt), 'yyyy.MM.dd')}]
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 line-clamp-1 uppercase tracking-tighter">{" >> "} {meeting.summary}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/meeting/${meeting.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-none border border-zinc-900 hover:border-cyan-400 hover:bg-black text-zinc-700 hover:text-cyan-400">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-none border border-zinc-900 hover:border-magenta-500 hover:bg-black text-zinc-700 hover:text-magenta-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredMeetings.length === 0 && (
            <div className="text-center py-24 bg-zinc-950 border-2 border-dashed border-zinc-900">
              <div className="inline-flex items-center justify-center w-20 h-20 border border-zinc-900 bg-black mb-6 text-zinc-900">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-zinc-600 font-pixel text-xl uppercase tracking-widest">SIGNAL_NOT_FOUND</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
