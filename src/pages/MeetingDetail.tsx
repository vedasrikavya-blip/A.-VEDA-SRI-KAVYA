import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, getDocFromServer } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  ArrowLeft, Mail, CheckCircle2, Circle, 
  MessageSquare, User, Calendar, Tag, Share2, Copy, BrainCircuit
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { ExportPdfButton } from "../components/ExportPdfButton";
import { FollowUpEmailCard } from "../components/FollowUpEmailCard";
import { toast } from "sonner";
import { motion } from "motion/react";
import { format } from "date-fns";

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
      <div className="flex h-screen items-center justify-center bg-[#FAFAF8]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FBFBFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Navigation Header */}
        <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-xl h-8 w-8 hover:bg-slate-50">
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#F59E0B] rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-gray-900 truncate max-w-[300px]">{meeting.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-9 text-xs font-bold border-gray-200">
              <Share2 className="h-3.5 w-3.5 mr-2" /> Share
            </Button>
            <ExportPdfButton meeting={meeting} tasks={tasks} />
          </div>
        </header>

        <main className="flex-1 p-8 grid grid-cols-12 gap-6 min-h-0 overflow-y-auto">
        {/* Left Column: Summary & Notes */}
        <div className="col-span-7 flex flex-col gap-6">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Intelligence Analysis</h2>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border tracking-widest uppercase ${
                meeting.sentiment.includes('Positive') 
                  ? 'bg-green-50 text-green-700 border-green-100' 
                  : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {meeting.sentiment.includes('Positive') ? 'Positive sentiment' : 'Neutral tone'}
              </span>
            </div>
            
            <div className="space-y-6 text-sm leading-relaxed text-gray-600">
              <div className="font-bold text-gray-800 text-lg leading-relaxed bg-[#FBFBFA] p-6 rounded-2xl border-l-4 border-[#F59E0B] shadow-sm">
                Summary: {meeting.summary}
              </div>

              <div>
                <h3 className="font-bold text-gray-800 text-[10px] uppercase mb-4 tracking-widest flex items-center gap-2">
                  <div className="h-1 w-4 bg-amber-400" /> Key Discussion Points
                </h3>
                <ul className="space-y-3">
                  {meeting.keyPoints?.map((point: string, i: number) => (
                    <li key={i} className="flex gap-3 items-start group">
                      <div className="h-5 w-5 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 font-medium group-hover:text-black transition-colors">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-50 flex flex-wrap gap-2">
                {meeting.topics?.map((topic: string, i: number) => (
                  <Badge key={i} variant="secondary" className="rounded-lg bg-gray-50 text-gray-500 border border-gray-100 px-3 py-1 uppercase text-[9px] font-black tracking-wider">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </section>

          <FollowUpEmailCard 
            meetingId={meeting.id}
            initialSubject={`Meeting Follow-Up: ${meeting.title}`}
            initialBody={meeting.followUpEmail}
            meetingData={{
              title: meeting.title,
              summary: meeting.summary,
              keyPoints: meeting.keyPoints,
              tasks: tasks
            }}
          />
        </div>

        {/* Right Column: Task Extraction */}
        <div className="col-span-5 h-full">
          <section className="bg-white flex flex-col h-full max-h-[calc(100vh-10rem)] rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-0">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Action Items</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tasks.filter(t => !t.completed).length} items remaining</p>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase sticky top-0 z-10 backdrop-blur-sm border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-4">Status & Task</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4 text-right">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map((task) => (
                    <tr key={task.id} className={`group hover:bg-slate-50/50 transition-colors ${task.completed ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button 
                            onClick={() => toggleTask(task.id, task.completed)}
                            className={`h-5 w-5 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-all shrink-0 ${
                              task.completed 
                                ? 'bg-amber-500 border-amber-500 text-white' 
                                : 'border-gray-200 group-hover:border-amber-400'
                            }`}
                          >
                            {task.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>
                          <div>
                            <div className={`font-bold text-gray-900 leading-snug ${task.completed ? 'line-through' : ''}`}>{task.task}</div>
                            <div className={`text-[9px] font-black uppercase mt-1 ${
                              task.priority === 'high' ? 'text-red-500' : 
                              task.priority === 'medium' ? 'text-amber-500' : 'text-slate-400'
                            }`}>
                              {task.priority} Priority
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-lg font-black uppercase text-[9px] border border-slate-100">
                          {task.owner}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-right text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                        {task.deadline}
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                        No Intelligence Extracted
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex-shrink-0">
              <Button className="w-full h-11 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition-all">
                Export & Sync
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
  );
}
