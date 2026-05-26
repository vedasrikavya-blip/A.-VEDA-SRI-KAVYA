import { useState, useEffect } from "react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { MeetingAnalysis } from "../types";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { 
  FileText, Plus, Search, ChevronRight, Upload, Loader2, Sparkles, 
  Calendar, CheckCircle2, Clock, Zap, History as HistoryIcon,
  Users, Brain, Terminal, User, Mail
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
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           const text = await res.text();
           console.error("Unexpected response from parse-document:", text);
           throw new Error("Server communication error (Expected JSON, received HTML)");
        }
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        textToProcess = data.text;
      }

      const analysisRes = await fetch("/api/analyze-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess }),
      });

      const analysisContentType = analysisRes.headers.get("content-type");
      if (!analysisContentType || !analysisContentType.includes("application/json")) {
        const text = await analysisRes.text();
        console.error("Unexpected response from analyze-notes:", text);
        throw new Error("Analysis failed: Server returned non-JSON response");
      }

      const analysis: MeetingAnalysis = await analysisRes.json();
      if ((analysis as any).error) throw new Error((analysis as any).error);
      
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
    <div className="flex min-h-screen bg-black font-sans text-cyan-400">
      <div className="crt-scanline"></div>
      <Sidebar docCount={meetings.length} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <header className="flex justify-between items-center mb-12">
           <div className="relative group">
              <input 
                type="text" 
                placeholder="PROBE_WORKSPACE..." 
                className="bg-black border-2 border-zinc-800 rounded-none py-2 px-5 text-xs w-72 focus:outline-none focus:border-cyan-400 font-mono transition-all text-cyan-400 shadow-[2px_2px_0px_#111]"
              />
              <Search className="absolute right-4 top-2.5 h-4 w-4 text-zinc-700 group-focus-within:text-cyan-400 transition-colors" />
           </div>
           <div className="flex gap-4">
              <Button onClick={processNotes} className="bg-transparent border-2 border-magenta-500 text-magenta-500 px-6 h-11 rounded-none text-xs font-pixel tracking-widest shadow-[4px_4px_0px_#00FFFF] hover:bg-magenta-500 hover:text-white transition-all">
                <Plus className="mr-2 h-4 w-4" /> NEW_INGEST
              </Button>
           </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
           <StatCard label="Binary_Assets" value={meetings.length} />
           <StatCard label="Tasks_Extracted" value={meetings.reduce((acc, m) => acc + (m.taskCount || 0), 0) || "0"} />
           <StatCard label="Temporal_Gain" value="42h" />
           <StatCard label="Engine_Precision" value="98%" />
        </div>

        <section className="grid grid-cols-12 gap-10">
           {/* Left Column: Create New Intelligence */}
           <div className="col-span-12 lg:col-span-12">
              <Card className="rounded-none border-2 border-zinc-800 bg-zinc-950 p-1 shadow-[10px_10px_0px_#111]">
                <CardHeader className="bg-black border-b border-zinc-800 p-8">
                   <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-pixel tracking-widest uppercase flex items-center gap-3">
                        <Sparkles className="text-magenta-500 h-6 w-6 glitch-text" /> Neural_Synthesis_v3
                      </CardTitle>
                      <Badge variant="outline" className="rounded-none border-cyan-900 bg-cyan-950/20 text-cyan-400 font-mono text-[10px] uppercase px-3 py-1">System_Status: Operational</Badge>
                   </div>
                   <CardDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2 px-1">Convert raw conversational streams into actionable protocol data.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 bg-black">
                  <div className="space-y-10">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 px-1">Protocol_Identifier</label>
                       <Input 
                        placeholder="E.G. PROJECT_CYBERPUNK_SYNC" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-none h-14 border-2 border-zinc-900 bg-zinc-950 focus:border-cyan-400 font-mono text-cyan-400 placeholder:text-zinc-800"
                       />
                    </div>

                    <Tabs defaultValue="upload" className="w-full">
                       <TabsList className="grid w-full grid-cols-2 rounded-none bg-zinc-900 p-1 mb-8 border border-zinc-800">
                          <TabsTrigger value="upload" className="rounded-none font-pixel text-sm uppercase data-[state=active]:bg-cyan-400 data-[state=active]:text-black">{" >> "} SOURCE_FILE</TabsTrigger>
                          <TabsTrigger value="paste" className="rounded-none font-pixel text-sm uppercase data-[state=active]:bg-magenta-500 data-[state=active]:text-white">{" >> "} DATA_STREAM</TabsTrigger>
                       </TabsList>
                       
                       <TabsContent value="upload" className="focus-visible:outline-none">
                          <div 
                            className={`border-2 border-dashed rounded-none p-16 text-center transition-all ${file ? 'border-cyan-400 bg-cyan-950/10' : 'border-zinc-800 hover:border-cyan-900 bg-zinc-950'}`}
                          >
                             <div className="flex flex-col items-center gap-6">
                               <div className="h-20 w-20 border-2 border-zinc-800 bg-black flex items-center justify-center text-zinc-700 shadow-[4px_4px_0px_#111] group-hover:border-cyan-400 group-hover:text-cyan-400">
                                  {file ? <FileText className="text-cyan-400 h-10 w-10" /> : <Upload className="h-10 w-10" />}
                               </div>
                               <div>
                                  <p className="font-pixel text-xl tracking-widest text-cyan-400 uppercase">{file ? file.name : "LOAD_DOCUMENT"}</p>
                                  <p className="font-mono text-[10px] text-zinc-600 mt-2 uppercase">PDF, DOCX, TXT | MAX_SIZE: 20MB</p>
                               </div>
                               <input 
                                 type="file" 
                                 id="file-upload" 
                                 className="hidden" 
                                 accept=".pdf,.docx,.txt,.md"
                                 onChange={handleFileUpload}
                               />
                               <Button variant="outline" asChild className="rounded-none border-2 border-cyan-400 bg-transparent text-cyan-400 font-pixel uppercase hover:bg-cyan-400 hover:text-black shadow-[4px_4px_0px_#FF00FF] transition-all">
                                  <label htmlFor="file-upload" className="cursor-pointer px-10 h-12 flex items-center">{file ? "OVERWRITE_SOURCE" : "SELECT_FILE"}</label>
                               </Button>
                             </div>
                          </div>
                       </TabsContent>

                       <TabsContent value="paste" className="focus-visible:outline-none">
                          <Textarea 
                            placeholder="PASTE_RAW_TRANSCRIPT_CODE_HERE..."
                            className="min-h-[250px] rounded-none border-2 border-zinc-800 bg-black p-8 text-xs font-mono leading-relaxed resize-none focus:border-magenta-500 text-magenta-500 placeholder:text-zinc-900"
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                          />
                       </TabsContent>
                    </Tabs>

                    <Button 
                      onClick={processNotes} 
                      disabled={isAnalyzing || (!file && !pastedText)}
                      className="w-full h-16 rounded-none bg-cyan-400 hover:bg-cyan-500 text-black font-pixel text-2xl uppercase shadow-[6px_6px_0px_#FF00FF] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          DECODING_INTELLIGENCE...
                        </>
                      ) : (
                        <>
                          EXECUTE_SYNTHESIS <Sparkles className="ml-3 h-6 w-6" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
           </div>

           {/* Recent Intelligence */}
           <div className="col-span-12 mt-12">
              <div className="flex items-center justify-between mb-8 border-b-2 border-zinc-900 pb-4">
                 <h2 className="text-2xl font-pixel uppercase tracking-widest text-white glitch-text">Memory_Bank</h2>
                 <Link to="/history" className="text-[10px] font-black text-cyan-600 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em]">[ View_Access_Logs ]</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <AnimatePresence mode="popLayout">
                    {meetings.length === 0 && !loadingTasks && (
                      <div className="col-span-full py-24 text-center border-2 border-dashed border-zinc-800 bg-zinc-950/20">
                         <div className="h-20 w-20 border border-zinc-800 flex items-center justify-center text-zinc-800 mx-auto mb-6">
                            <HistoryIcon size={40} />
                         </div>
                         <p className="text-zinc-600 font-pixel text-xl uppercase tracking-widest">Database_Empty</p>
                      </div>
                    )}
                    {meetings.slice(0, 6).map((m, idx) => (
                       <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="h-full"
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
      <div className="bg-zinc-950 border-2 border-zinc-900 p-6 shadow-[4px_4px_0px_#111] hover:border-zinc-700 transition-all group">
         <div className="text-zinc-700 text-[9px] font-mono uppercase tracking-[0.3em] mb-3 group-hover:text-magenta-500 transition-colors">{" >> "} {label}</div>
         <div className="text-4xl font-pixel text-cyan-400 tracking-wider glitch-text">{value}</div>
      </div>
   );
}

function IntelligenceCard({ meeting }: { meeting: any }) {
   return (
      <Link to={`/meeting/${meeting.id}`} className="h-full block">
        <Card className="group border-2 border-zinc-900 bg-zinc-950 h-full rounded-none p-8 hover:border-cyan-400 transition-all cursor-pointer relative overflow-hidden shadow-[6px_6px_0px_#000]">
           <div className="flex items-center justify-between mb-6">
              <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">{format(new Date(meeting.createdAt), 'yyyy.MM.dd | HH:mm')}</span>
              <div className="h-2 w-2 bg-cyan-400 animate-pulse" />
           </div>
           <h3 className="text-xl font-pixel uppercase tracking-widest text-cyan-400 mb-4 group-hover:text-magenta-500 transition-colors leading-tight line-clamp-2">{meeting.title}</h3>
           <p className="text-[10px] text-zinc-500 font-mono line-clamp-3 mb-8 leading-relaxed border-l-2 border-zinc-900 pl-4 bg-zinc-900/10 py-2">{meeting.summary}</p>
           
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                <Mail size={12} className={meeting.followUpEmail ? "text-magenta-500" : "text-zinc-800"} />
                <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-tighter">Draft: {meeting.followUpEmail ? "READY" : "NONE"}</span>
             </div>
           </div>

           <div className="flex items-center justify-between pt-6 border-t border-zinc-900 mt-auto">
              <div className="flex items-center gap-1.5">
                 {[1,2,3].slice(0, meeting.topics?.length || 0).map(t => (
                    <div key={t} className="h-3 w-3 bg-cyan-900/50 border border-cyan-400 shadow-[1px_1px_0px_#FF00FF]"></div>
                 ))}
                 {(meeting.topics?.length || 0) > 3 && (
                    <div className="text-[8px] font-black text-cyan-900 ml-1">+{meeting.topics.length - 3}</div>
                 )}
              </div>
              <div className="flex items-center gap-2 text-zinc-700 group-hover:text-cyan-400 transition-colors">
                <span className="text-[10px] font-pixel uppercase tracking-widest">ACCESS</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
           </div>
        </Card>
      </Link>
   );
}
