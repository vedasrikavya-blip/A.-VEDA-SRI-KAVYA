import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { auth, db } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { 
  Search, Filter, Trash2, Download, 
  ExternalLink, Calendar, ArrowUpDown 
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
    <div className="flex min-h-screen bg-[#FBFBFA]">
      <Sidebar docCount={meetings.length} />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Meeting History</h1>
            <p className="text-sm text-gray-500 font-medium">Manage and review your past AI-analyzed meetings.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-xl h-10 border-slate-200">
               <Download className="w-4 h-4 mr-2" /> Export All
             </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search meetings, summaries..." 
              className="pl-11 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-amber-500 focus:border-amber-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="h-12 px-6 rounded-2xl border-slate-100 bg-white shadow-sm flex items-center gap-2 font-bold text-sm text-slate-700"
            onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortBy === "newest" ? "Newest First" : "Oldest First"}
          </Button>
          <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-slate-100 bg-white shadow-sm">
            <Filter className="w-4 h-4 text-slate-600" />
          </Button>
        </div>

        {/* History Table/List */}
        <div className="space-y-4">
          {filteredMeetings.map((meeting, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={meeting.id}
            >
              <Card className="p-5 border-none shadow-sm shadow-slate-100 hover:shadow-md transition-shadow group flex items-center gap-6">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{meeting.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {format(new Date(meeting.createdAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{meeting.summary}</p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to={`/meeting/${meeting.id}`}>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredMeetings.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-gray-500 font-bold">No meetings found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
