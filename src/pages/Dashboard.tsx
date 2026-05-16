import { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { analyzeMeetingNotes, MeetingAnalysis } from "../lib/gemini";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { 
  FileText, Plus, Search, ChevronRight, Upload, Loader2, Sparkles, 
  Calendar, CheckCircle2, Clock, Zap, History as HistoryIcon
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

export default function Dashboard() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, "meetings"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      setMeetings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingTasks(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "meetings");
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTitle(selectedFile.name.split('.')[0]);
    }
  };

  const processNotes = async () => {
    if (!title) return toast.error("Please provide a title");
    if (!pastedText && !file) return toast.error("Please provide notes or upload a file");

    setIsAnalyzing(true);
    try {
      let textToProcess = pastedText;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse-document", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        textToProcess = data.text;
      }

      const analysis = await analyzeMeetingNotes(textToProcess);
      
      const meetingRef = await addDoc(collection(db, "meetings"), {
        userId: auth.currentUser?.uid,
        title,
        content: textToProcess,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
        followUpEmail: analysis.follow_up_email,
        topics: analysis.meeting_topics,
        keyPoints: analysis.key_points,
        createdAt: new Date().toISOString(),
      });

      // Save tasks
      for (const item of analysis.action_items) {
        await addDoc(collection(db, "tasks"), {
          meetingId: meetingRef.id,
          userId: auth.currentUser?.uid,
          task: item.task,
          owner: item.owner,
          deadline: item.deadline,
          priority: item.priority,
          completed: false,
          createdAt: new Date().toISOString(),
        });
      }

      toast.success("Meeting intelligence generated!");
      navigate(`/meeting/${meetingRef.id}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to analyze notes");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FBFBFA]">
      <Sidebar docCount={meetings.length} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
           <div className="relative group">
              <input 
                type="text" 
                placeholder="Search workspace..." 
                className="bg-white border border-gray-100 rounded-full py-2 px-5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/10 shadow-sm transition-all"
              />
              <Search className="absolute right-4 top-2.5 h-4 w-4 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
           </div>
           <div className="flex gap-4">
              <Button onClick={processNotes} className="bg-[#F59E0B] text-white px-6 h-11 rounded-xl text-sm font-bold shadow-sm hover:bg-[#D97706] transition-all">
                <Plus className="mr-2 h-5 w-5" /> New Upload
              </Button>
           </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
           <StatCard label="Documents" value={meetings.length} />
           <StatCard label="Tasks Extracted" value={meetings.reduce((acc, m) => acc + (m.taskCount || 0), 0) || "0"} />
           <StatCard label="Time Saved" value="42h" />
           <StatCard label="Accuracy" value="98%" />
        </div>

        <section className="grid grid-cols-12 gap-8">
           {/* Left Column: Create New Intelligence */}
           <div className="col-span-12 lg:col-span-12">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 p-8">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-amber-500 h-5 w-5" /> Generate Intelligence
                      </CardTitle>
                      <Badge variant="outline" className="rounded-full bg-amber-50 text-amber-600 border-amber-100">AI Engine Active</Badge>
                   </div>
                   <CardDescription>Upload a transcript or paste notes to extract action items and summaries.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Meeting Title</label>
                       <Input 
                        placeholder="e.g. Q3 Strategic Planning" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-xl h-12 border-slate-200 bg-slate-50/50"
                       />
                    </div>

                    <Tabs defaultValue="upload" className="w-full">
                       <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100/50 p-1 mb-6">
                          <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Upload File</TabsTrigger>
                          <TabsTrigger value="paste" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Paste Content</TabsTrigger>
                       </TabsList>
                       
                       <TabsContent value="upload">
                          <div 
                            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${file ? 'border-amber-500 bg-amber-50/20' : 'border-slate-200 hover:border-amber-300 bg-slate-50/50'}`}
                          >
                             <div className="flex flex-col items-center gap-4">
                               <div className="h-16 w-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-400">
                                  {file ? <FileText className="text-amber-500 h-8 w-8" /> : <Upload className="h-8 w-8" />}
                               </div>
                               <div>
                                  <p className="font-bold text-slate-900">{file ? file.name : "Select a document"}</p>
                                  <p className="text-xs text-slate-400 mt-1">PDF, Word, or TXT up to 20MB</p>
                               </div>
                               <input 
                                type="file" 
                                id="file-upload" 
                                className="hidden" 
                                accept=".pdf,.docx,.txt,.md"
                                onChange={handleFileUpload}
                               />
                               <Button variant="outline" asChild className="rounded-full h-11 px-8 font-bold border-slate-200 bg-white">
                                  <label htmlFor="file-upload" className="cursor-pointer">{file ? "Change File" : "Browse Files"}</label>
                               </Button>
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="paste">
                          <Textarea 
                            placeholder="Paste meeting transcript or raw notes here..."
                            className="min-h-[220px] rounded-3xl border-slate-200 bg-slate-50/50 p-6 focus:ring-amber-500"
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                          />
                       </TabsContent>
                    </Tabs>

                    <Button 
                      onClick={processNotes} 
                      disabled={isAnalyzing || (!file && !pastedText)}
                      className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-lg shadow-xl shadow-slate-200"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing Intelligence...
                        </>
                      ) : (
                        <>
                          Extract Intelligence <Sparkles className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
           </div>

           {/* Recent Intelligence */}
           <div className="col-span-12 mt-8">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold">Recent Intelligence</h2>
                 <Link to="/history" className="text-xs font-bold text-amber-600 hover:underline">View all history</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <AnimatePresence mode="popLayout">
                    {meetings.length === 0 && !loadingTasks && (
                      <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                         <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto mb-4">
                            <HistoryIcon size={32} />
                         </div>
                         <p className="text-slate-400 font-medium">No meetings processed yet.</p>
                      </div>
                    )}
                    {meetings.slice(0, 6).map((m, idx) => (
                       <motion.div
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                       >
                         <IntelligenceCard meeting={m} />
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
   return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
         <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</div>
         <div className="text-3xl font-black text-gray-900 tracking-tighter">{value}</div>
      </div>
   );
}

function IntelligenceCard({ meeting }: { meeting: any }) {
   return (
      <Link to={`/meeting/${meeting.id}`}>
        <Card className="group border-none shadow-sm shadow-slate-100 rounded-3xl p-6 bg-white hover:shadow-xl hover:shadow-amber-50 transition-all cursor-pointer">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(new Date(meeting.createdAt), 'MMM dd, yyyy')}</span>
              <div className="h-2 w-2 rounded-full bg-green-500" />
           </div>
           <h3 className="font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">{meeting.title}</h3>
           <p className="text-xs text-slate-500 line-clamp-2 mb-6 leading-relaxed bg-slate-50 p-2 rounded-lg">{meeting.summary}</p>
           
           <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex -space-x-2">
                 {[1,2,3].slice(0, meeting.topics?.length || 0).map(t => (
                    <div key={t} className="h-6 w-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-amber-600">
                       AI
                    </div>
                 ))}
                 {(meeting.topics?.length || 0) > 3 && (
                    <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                       +{meeting.topics.length - 3}
                    </div>
                 )}
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
           </div>
        </Card>
      </Link>
   );
}
