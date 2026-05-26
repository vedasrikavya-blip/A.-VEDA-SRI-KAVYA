import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, getDocFromServer } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  ArrowLeft, Mail, CheckCircle2, Circle, 
  MessageSquare, User, Calendar, Tag, Share2, Copy, BrainCircuit,
  Zap, Activity, Download, Check, Loader2, Sparkles, Terminal
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { FollowUpEmailCard } from "../components/FollowUpEmailCard";
import { toast } from "sonner";
import { motion } from "motion/react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";

export default function MeetingDetail() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMeeting = async () => {
      try {
        const docSnap = await getDoc(doc(db, "meetings", id));
        if (docSnap.exists()) {
          setMeeting({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Meeting not found");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `meetings/${id}`);
      }
    };

    const q = query(
      collection(db, "tasks"),
      where("meetingId", "==", id),
      where("userId", "==", auth.currentUser?.uid)
    );

    const unsubTasks = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "tasks");
    });

    fetchMeeting();
    return () => unsubTasks();
  }, [id]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), {
        completed: !currentStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
      toast.error("Failed to update task");
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(meeting.followUpEmail);
    toast.success("Follow-up email copied to clipboard!");
  };

  if (loading || !meeting) {
    return (
      <div className="flex h-screen items-center justify-center bg-black font-pixel">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
           <p className="text-cyan-900 text-[10px] uppercase tracking-widest animate-pulse">Establishing_Neural_Sync...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black font-sans text-cyan-400">
      <div className="crt-scanline"></div>
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Navigation Header */}
        <header className="h-16 border-b-2 border-zinc-900 bg-black flex items-center justify-between px-8 sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-6">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-none h-10 w-10 border border-zinc-800 hover:border-cyan-400 text-zinc-500 hover:text-cyan-400 transition-all">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border-2 border-cyan-400 bg-black flex items-center justify-center shadow-[2px_2px_0px_#FF00FF]">
                <BrainCircuit className="w-6 h-6 text-cyan-400 glitch-text" />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-lg tracking-widest text-white uppercase glitch-text truncate max-w-[400px]">{meeting.title}</span>
                <span className="font-mono text-[8px] text-zinc-700 uppercase tracking-tighter">NODE_ID: {meeting.id.slice(0, 12)} | {format(new Date(meeting.createdAt), 'yyyy.MM.dd | HH:mm')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
               variant="outline" 
               className="rounded-none h-10 px-6 text-[10px] font-pixel tracking-widest uppercase border-2 border-zinc-800 bg-zinc-950 text-zinc-600 hover:text-cyan-400 hover:border-cyan-400 shadow-[3px_3px_0px_#000] hover:shadow-[3px_3px_0px_#FF00FF] transition-all"
               onClick={() => {
                 const doc = new jsPDF();
                 doc.setFontSize(22);
                 doc.text("BINARY_ASSET_RECOVERY_DEED", 20, 20);
                 doc.setFontSize(14);
                 doc.text(`ID: ${meeting.id}`, 20, 30);
                 doc.text(`DATE: ${meeting.createdAt}`, 20, 40);
                 doc.text(`TITLE: ${meeting.title}`, 20, 50);
                 doc.line(20, 55, 190, 55);
                 doc.text("PROTOCOL_SUMMARY:", 20, 65);
                 const splitSummary = doc.splitTextToSize(meeting.summary, 170);
                 doc.text(splitSummary, 20, 75);
                 doc.save(`NEURAL_DUMP_${meeting.id.slice(0, 8)}.pdf`);
                 toast.success("Binary Dump Successful");
               }}
            >
              <Download className="h-4 w-4 mr-3" /> PDF_RECOVERY
            </Button>
            <Button 
               className="rounded-none h-10 px-6 text-[10px] font-pixel tracking-widest uppercase bg-magenta-500 text-white shadow-[3px_3px_0px_#00FFFF] hover:bg-magenta-600 active:translate-x-1 transition-all"
               onClick={() => {
                 document.getElementById('follow-up-card')?.scrollIntoView({ behavior: 'smooth' });
                 toast("Uplink Protocol Active: Redirecting to Transmission Node", {
                   icon: <Zap className="h-4 w-4 text-magenta-500" />
                 });
               }}
            >
              <Share2 className="h-4 w-4 mr-3" /> TRANSMIT_SYNC
            </Button>
          </div>
        </header>

        <main className="flex-1 p-8 grid grid-cols-12 gap-8 min-h-0 overflow-y-auto">
        {/* Left Column: Summary & Notes */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-8">
          <section className="bg-zinc-950 p-10 border-2 border-zinc-800 relative shadow-[12px_12px_0px_#000]">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-zinc-800 text-[8px] font-black text-cyan-900 uppercase">Buffer_Segment_001</div>
            <div className="flex items-center justify-between mb-10 border-b border-zinc-900 pb-6">
              <h2 className="text-2xl font-pixel text-white tracking-widest uppercase glitch-text flex items-center gap-3">
                <Sparkles className="text-magenta-500 w-6 h-6" /> Neural_Intelligence_Map
              </h2>
              <span className={`text-[9px] font-black px-4 py-1.5 border-2 tracking-widest uppercase ${
                meeting.sentiment.includes('Positive') 
                  ? 'bg-cyan-950/20 text-cyan-400 border-cyan-900 shadow-[2px_2px_0px_#FF00FF]' 
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800'
              }`}>
                SIGNAL: {meeting.sentiment}
              </span>
            </div>
            
            <div className="space-y-10">
              <div className="font-mono text-sm leading-relaxed text-cyan-600 bg-black p-8 border-l-4 border-cyan-400 shadow-[6px_6px_0px_#111]">
                <span className="text-zinc-800 mr-2">{" >> "} BASE_SUMMARY:</span> "{meeting.summary}"
              </div>

              <div>
                <h3 className="font-pixel text-xs text-zinc-600 uppercase mb-6 tracking-[0.4em] flex items-center gap-3">
                  <div className="h-0.5 w-10 bg-cyan-900" /> RECOVERED_DATA_NODES
                </h3>
                <div className="space-y-4">
                  {meeting.keyPoints?.map((point: string, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 items-start group p-3 hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="h-6 w-10 border border-zinc-800 bg-black text-zinc-800 group-hover:text-cyan-400 group-hover:border-cyan-400 flex items-center justify-center shrink-0 font-pixel text-[10px] transition-all">
                        {i + 1}_
                      </div>
                      <p className="text-zinc-400 font-mono text-xs leading-relaxed group-hover:text-zinc-200 transition-colors">{point}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t border-zinc-900 flex flex-wrap gap-3">
                {meeting.topics?.map((topic: string, i: number) => (
                  <Badge key={i} variant="outline" className="rounded-none border-2 border-zinc-800 bg-black text-zinc-600 px-4 py-1.5 uppercase text-[9px] font-black tracking-[0.2em] hover:border-magenta-500 hover:text-magenta-500 transition-colors">
                    # {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          <div id="follow-up-card">
            <FollowUpEmailCard 
              meetingId={meeting.id}
              initialSubject={`NEURAL_LINK_FOLLOWUP_PROTOCOL: ${meeting.title.toUpperCase()}`}
              initialBody={meeting.followUpEmail}
              meetingData={{
                title: meeting.title,
                summary: meeting.summary,
                keyPoints: meeting.keyPoints,
                tasks: tasks
              }}
            />
          </div>
        </div>

        {/* Right Column: Task Extraction */}
        <div className="col-span-12 lg:col-span-5 h-full">
          <section className="bg-zinc-950 flex flex-col h-full max-h-[calc(100vh-10rem)] border-2 border-zinc-900 shadow-[12px_12px_0px_#000] overflow-hidden sticky top-0 px-2">
            <div className="p-8 border-b-2 border-zinc-900 flex justify-between items-center bg-black flex-shrink-0">
              <div className="flex flex-col">
                <h2 className="text-xl font-pixel text-white tracking-widest uppercase glitch-text flex items-center gap-3">
                  <Terminal className="text-cyan-400 w-5 h-5" /> Task_Payload
                </h2>
                <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest mt-2">{tasks.filter(t => !t.completed).length} NODES_STILL_PENDING</p>
              </div>
              <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center">
                 <CheckCircle2 className="text-zinc-900 w-6 h-6" />
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1 p-6 space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`p-6 border-2 transition-all cursor-pointer group relative ${
                    task.completed 
                      ? 'bg-zinc-900 border-zinc-900 opacity-40' 
                      : 'bg-black border-zinc-900 hover:border-cyan-400 hover:translate-y-[-2px] shadow-[4px_4px_0px_#000]'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`h-5 w-5 border-2 mt-1 flex items-center justify-center shrink-0 transition-all ${
                      task.completed 
                        ? 'bg-cyan-400 border-cyan-400 text-black' 
                        : 'bg-transparent border-zinc-800 group-hover:border-cyan-400'
                    }`}>
                      {task.completed && <Check className="h-4 w-4" strokeWidth={4} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-mono text-xs uppercase mb-3 leading-snug tracking-tighter ${task.completed ? 'line-through text-zinc-600' : 'text-cyan-600'}`}>{task.task}</div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-[9px] font-pixel text-zinc-500 uppercase">NODE: {task.owner}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${
                              task.priority === 'high' ? 'text-magenta-500 border-magenta-500 bg-magenta-500/10' : 
                              task.priority === 'medium' ? 'text-cyan-400 border-cyan-400 bg-cyan-400/10' : 'text-zinc-700 border-zinc-800'
                            }`}>
                              {task.priority || 'NORMAL'}
                            </span>
                         </div>
                         <span className="text-[8px] font-mono text-zinc-800">{task.deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-zinc-900 text-zinc-700 text-xs font-pixel uppercase tracking-widest">
                  NO_SIGNAL_DECODED
                </div>
              )}
            </div>

            <div className="p-8 bg-zinc-950 border-t-2 border-zinc-900 flex-shrink-0">
              <Button className="w-full h-14 bg-cyan-400 hover:bg-cyan-500 text-black rounded-none font-pixel text-lg tracking-widest uppercase shadow-[6px_6px_0px_#FF00FF] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                COMMIT_TO_LEDGER
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
  );
}
