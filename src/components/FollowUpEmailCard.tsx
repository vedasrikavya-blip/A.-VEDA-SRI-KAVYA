import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "./ui/dialog";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  Mail, Copy, RotateCcw, Send, Check, 
  Loader2, Sparkles, Terminal
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface Task {
  task: string;
  owner: string;
  deadline: string;
  priority: string;
  completed: boolean;
}

interface FollowUpEmailCardProps {
  meetingId: string;
  initialSubject?: string;
  initialBody?: string;
  meetingData: {
    title: string;
    summary: string;
    keyPoints: string[];
    tasks: Task[];
  };
}

export function FollowUpEmailCard({ 
  meetingId, 
  initialSubject, 
  initialBody,
  meetingData 
}: FollowUpEmailCardProps) {
  const [subject, setSubject] = useState(initialSubject || "Meeting Follow-Up");
  const [body, setBody] = useState(initialBody || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingData })
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Unexpected response from generate-email:", text);
        throw new Error("Server returned HTML instead of JSON");
      }

      if (!response.ok) throw new Error("Failed to generate");
      
      const data = await response.json();
      setSubject(data.subject);
      setBody(data.body);
      
      // Persist to database
      await updateDoc(doc(db, "meetings", meetingId), {
        followUpEmail: data.body
      });

      toast.success("AI Draft regenerated and saved");
    } catch (error) {
      console.error(error);
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!recipient) {
      toast.error("Please enter a recipient email");
      return;
    }
    
    setIsSending(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: recipient, subject, body })
      });

      if (!response.ok) throw new Error("Failed to send");
      
      toast.success("Email sent successfully!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Could not send email. Check API configuration.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="rounded-none border-2 border-zinc-800 bg-zinc-950 p-1 shadow-[8px_8px_0px_#111] overflow-hidden group">
      {/* Glitch Decorative Element */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Terminal className="w-24 h-24 rotate-12" />
      </div>

      <CardHeader className="bg-black border-b border-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[2px_2px_0px_#FF00FF]">
              <Mail size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-pixel uppercase tracking-widest text-white">Neural_Draft</CardTitle>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-1">Ready_for_Transmission</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRegenerate} 
            disabled={isGenerating}
            className="rounded-none h-9 hover:bg-magenta-500 hover:text-white text-zinc-500 font-pixel text-[10px] uppercase gap-2 border border-transparent hover:border-magenta-400"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            RE_SYNTAX
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8 bg-black space-y-6">
        {/* Subject Line */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] px-1">PROTOCOL_ID</label>
          <div className="bg-zinc-950 border-2 border-zinc-900 rounded-none p-4 text-xs font-mono text-cyan-400">
            {subject}
          </div>
        </div>

        {/* Body Area */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] px-1">PAYLOAD_CONTENT</label>
          <div className="relative">
            <div className={`bg-zinc-950 border-2 border-zinc-900 rounded-none p-6 text-[11px] text-zinc-400 leading-relaxed min-h-[220px] whitespace-pre-wrap font-mono transition-all ${isGenerating ? 'blur-sm grayscale opacity-30 italic text-cyan-900' : ''}`}>
               {isGenerating ? 'DECODING_STREAM_IN_PROGRESS...' : (body || "NO_DATA_RECOVERED")}
            </div>
            
            <AnimatePresence>
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-black border-2 border-magenta-500 px-6 py-3 shadow-[4px_4px_0px_#00FFFF] flex items-center gap-3">
                    <Loader2 className="animate-spin text-magenta-500" size={16} />
                    <span className="text-[10px] font-pixel text-white uppercase tracking-widest">Neural_Engine_Thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4 pt-2">
          <Button 
            onClick={handleCopy}
            variant="outline" 
            className="flex-1 rounded-none h-12 border-2 border-zinc-800 font-pixel text-xs bg-transparent text-zinc-500 hover:text-cyan-400 hover:border-cyan-400 shadow-[4px_4px_0px_#111] transition-all flex items-center gap-2 group"
          >
            {isCopied ? <Check size={18} className="text-cyan-400" /> : <Copy size={18} />}
            {isCopied ? "CAPTURED" : "COPY_STRING"}
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger 
              render={
                <Button className="flex-1 bg-cyan-400 text-black rounded-none h-12 font-pixel text-xs shadow-[4px_4px_0px_#FF00FF] hover:bg-cyan-500 transition-all flex items-center gap-2">
                  <Send size={18} />
                  TRANSCEIVE
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-none border-2 border-zinc-800 bg-zinc-950 p-8 shadow-[15px_15px_0px_#000]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-pixel text-white uppercase tracking-widest glitch-text">Dispatch_Protocol</DialogTitle>
                <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter mt-1">Deliver binary draft to remote node</div>
              </DialogHeader>
              <div className="space-y-6 py-6 font-mono">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Target_Address</label>
                  <Input 
                    placeholder="RECIPIENT@NODE_DOMAIN.ORG" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="h-12 rounded-none border-2 border-zinc-900 bg-black focus:border-cyan-400 text-cyan-400 placeholder:text-zinc-900"
                  />
                </div>
                <div className="p-5 border-l-4 border-magenta-500 bg-zinc-900/40 flex items-start gap-4">
                   <div className="w-8 h-8 rounded-none border border-magenta-500 flex items-center justify-center text-magenta-500 flex-shrink-0 animate-pulse">
                      <Mail size={16} />
                   </div>
                   <div className="text-[9px] text-zinc-400 uppercase leading-snug tracking-tighter">
                      Transmission will use the <b className="text-white">NoteGenius_Core</b> proxy. Identity verification required.
                   </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSend} 
                  disabled={isSending}
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-black h-14 rounded-none font-pixel text-lg shadow-[6px_6px_0px_#FF00FF] transition-all"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  INIT_TRANSMISSION
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
