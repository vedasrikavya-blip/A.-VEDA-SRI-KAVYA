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
    <Card className="border-none shadow-sm shadow-slate-100 rounded-3xl p-8 bg-white relative overflow-hidden group">
      {/* Glitch Decorative Element */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Terminal className="w-24 h-24 rotate-12" />
      </div>

      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Mail size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">AI Follow-Up Email</CardTitle>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Professional draft ready for delivery</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRegenerate} 
            disabled={isGenerating}
            className="rounded-xl h-9 hover:bg-amber-50 hover:text-amber-600 font-bold text-xs gap-2"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            Regenerate
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Subject Line */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subject</label>
          <div className="bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700">
            {subject}
          </div>
        </div>

        {/* Body Area */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Message Body</label>
          <div className="relative">
            <div className={`bg-slate-50 border-none rounded-2xl p-6 text-sm text-slate-600 leading-relaxed min-h-[200px] whitespace-pre-wrap font-medium transition-all ${isGenerating ? 'blur-sm grayscale' : ''}`}>
              {body || (
                <div className="flex flex-col items-center justify-center h-full py-10 text-slate-300 italic">
                  <Sparkles size={32} className="mb-2 opacity-50" />
                  Generating draft...
                </div>
              )}
            </div>
            
            <AnimatePresence>
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-2xl backdrop-blur-[2px]"
                >
                  <div className="bg-white px-4 py-2 rounded-xl shadow-xl shadow-amber-100/50 flex items-center gap-3 border border-amber-100">
                    <Loader2 className="animate-spin text-amber-500" size={16} />
                    <span className="text-xs font-bold text-slate-900">AI is thinking...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 pt-2">
          <Button 
            onClick={handleCopy}
            variant="outline" 
            className="flex-1 rounded-2xl h-12 border-slate-100 font-bold text-sm bg-white shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 group"
          >
            {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="text-slate-400 group-hover:text-slate-600" />}
            {isCopied ? "Copied" : "Copy Content"}
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger 
              render={
                <Button className="flex-1 bg-[#F59E0B] text-white rounded-2xl h-12 font-bold text-sm shadow-md shadow-amber-100/50 hover:bg-[#D97706] transition-all flex items-center gap-2">
                  <Send size={18} />
                  Send via Resend
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">Dispatch AI Email</DialogTitle>
                <div className="text-xs text-slate-400 font-medium">Deliver this draft directly to stakeholders</div>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Email</label>
                  <Input 
                    placeholder="teammate@company.com" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="h-12 rounded-2xl border-slate-100 bg-slate-50 focus:ring-amber-500 font-medium"
                  />
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                   <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Mail size={16} />
                   </div>
                   <div className="text-[11px] text-amber-800 leading-relaxed">
                      This will be sent using our verified delivery engine. Stakeholders will see <b>NoteGenius</b> as the sender.
                   </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleSend} 
                  disabled={isSending}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white h-12 rounded-2xl font-bold gap-2"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Execute Send Operation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
