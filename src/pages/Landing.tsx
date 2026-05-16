import { useState } from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, FileText, CheckCircle2, Zap, 
  Layout, Mail, Share2, Globe, Shield, 
  Play, Sparkles, Upload, Loader2, ListChecks
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function Landing() {
  const [demoTranscript, setDemoTranscript] = useState("");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<{ summary: string, actions: string[] } | null>(null);

  const runDemo = async () => {
    if (!demoTranscript.trim()) return;
    setIsDemoLoading(true);
    // Simulate AI processing for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDemoResult({
      summary: "The team discussed the upcoming Q3 project launch and identified marketing as the primary bottleneck. The engineering team will focus on backend optimization while design finalizes the new UI components.",
      actions: [
        "Finalize marketing collateral by EOD Monday",
        "Backend team to complete API documentation",
        "Schedule design review for Tuesday 10AM"
      ]
    });
    setIsDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FCFCFB] font-sans text-slate-900 overflow-x-hidden selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-200/50 group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">NoteGenius</span>
          </Link>
          <div className="hidden items-center gap-10 lg:flex text-xs font-bold tracking-tight text-slate-500 uppercase">
            <a href="#features" className="hover:text-amber-600 transition-colors">Capabilities</a>
            <a href="#demo" className="hover:text-amber-600 transition-colors">Intelligence Demo</a>
            <a href="#pricing" className="hover:text-amber-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-slate-900 px-4 transition-colors">Log In</Link>
            <Button asChild className="rounded-2xl bg-slate-900 h-11 px-6 hover:bg-slate-800 shadow-xl shadow-slate-200/50 font-bold text-sm">
              <Link to="/login">Try Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_70%)] opacity-[0.03] blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-5 py-2 mb-8 shadow-sm">
              <div className="mr-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Advanced Meeting Intelligence</span>
            </div>
            
            <h1 className="mx-auto max-w-[900px] text-[clamp(2.5rem,8vw,6.5rem)] font-extrabold tracking-[-0.04em] leading-[0.95] text-slate-930 text-balance">
               Conversations to <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">Action</span> in seconds.
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-500 md:text-xl leading-relaxed font-medium px-4">
              Stop wandering through transcript graveyards. NoteGenius automates summaries, task identification, and stakeholder engagement.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row px-4">
              <Button asChild size="lg" className="h-16 w-full sm:w-auto rounded-2xl bg-amber-500 px-10 text-base font-extrabold hover:bg-amber-600 shadow-2xl shadow-amber-200 transition-all hover:scale-[1.02] active:scale-95">
                <Link to="/login">Start Analyzing Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-16 w-full sm:w-auto rounded-2xl bg-white px-10 text-base font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                <Play className="mr-2 h-4 w-4 text-amber-500" /> Watch Dashboard Demo
              </Button>
            </div>
          </motion.div>

          {/* AI Interactive Demo Section */}
          <section id="demo" className="mt-24 md:mt-32 max-w-5xl mx-auto px-4 md:px-0 scroll-mt-24">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
               className="rounded-[40px] border border-slate-100 bg-white p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden group"
             >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                  <Sparkles size={200} />
                </div>

                <div className="bg-slate-50 rounded-[32px] p-6 md:p-10">
                   <div className="grid lg:grid-cols-2 gap-10 items-start text-left">
                      <div className="space-y-6">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                             <Upload size={18} />
                           </div>
                           <h3 className="text-xl font-bold tracking-tight">Experience NoteGenius</h3>
                         </div>
                         
                         <div className="flex gap-4">
                           <Button 
                             onClick={() => toast.info("Transcription upload is active in the full dashboard")}
                             variant="outline" 
                             className="flex-1 h-12 rounded-2xl border-slate-200 font-bold text-xs gap-2 bg-white"
                           >
                             <Upload size={14} className="text-amber-500" />
                             Upload Transcript
                           </Button>
                           <Button 
                             variant="ghost" 
                             className="flex-1 h-12 rounded-2xl font-bold text-xs gap-2 hover:bg-slate-100"
                             onClick={() => setDemoTranscript("Sarah: Okay team, let's look at the Q4 roadmap. We're behind on backend tasks. \nMark: I can pull in some dev resources from the legacy team.\nSarah: Great, let's have that finalized by Friday.")}
                           >
                             <FileText size={14} className="text-blue-500" />
                             Use Sample Data
                           </Button>
                         </div>
                         
                         <div className="space-y-4">
                           <div className="relative">
                             <Textarea 
                               placeholder="Paste your meeting notes or raw transcript here..." 
                               className="min-h-[220px] rounded-[32px] border-none bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] p-8 text-sm font-medium leading-relaxed resize-none focus:ring-2 focus:ring-amber-200 transition-all placeholder:text-slate-300"
                               value={demoTranscript}
                               onChange={(e) => setDemoTranscript(e.target.value)}
                             />
                             <div className="absolute top-4 right-4 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
                               Transcript Node
                             </div>
                           </div>
                         </div>

                         <Button 
                           onClick={runDemo}
                           disabled={isDemoLoading || !demoTranscript.trim()}
                           className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base gap-3 shadow-xl shadow-amber-100 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
                         >
                           {isDemoLoading ? (
                             <>
                               <Loader2 className="animate-spin" size={20} />
                               Synthesizing Intelligence...
                             </>
                           ) : (
                             <>
                               <Zap size={20} fill="currentColor" />
                               Generate Intelligence Preview
                             </>
                           )}
                         </Button>
                      </div>

                      <div className="relative min-h-[400px]">
                        <AnimatePresence mode="wait">
                          {!demoResult ? (
                            <motion.div 
                              key="placeholder"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50"
                            >
                               <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center mb-6 text-slate-200">
                                 <FileText size={40} />
                               </div>
                               <h4 className="text-slate-900 font-bold mb-2">Awaiting Data</h4>
                               <p className="text-slate-400 text-sm max-w-xs">Input a transcript on the left to see NoteGenius extract magical insights.</p>
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="results"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="space-y-6"
                            >
                               <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/30 border border-slate-100">
                                  <div className="flex items-center gap-2 text-amber-500 mb-4 font-black text-[10px] uppercase tracking-widest">
                                    <Sparkles size={14} />
                                    AI Executive Summary
                                  </div>
                                  <p className="text-slate-600 text-sm leading-relaxed font-bold italic">
                                    "{demoResult.summary}"
                                  </p>
                               </div>

                               <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200/30 border border-slate-100">
                                  <div className="flex items-center gap-2 text-blue-500 mb-4 font-black text-[10px] uppercase tracking-widest">
                                    <ListChecks size={14} />
                                    Detected Action Items
                                  </div>
                                  <ul className="space-y-4">
                                     {demoResult.actions.map((action, i) => (
                                       <motion.li 
                                         initial={{ opacity: 0, y: 10 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         transition={{ delay: i * 0.1 }}
                                         key={i} 
                                         className="flex items-center gap-3 text-sm font-bold text-slate-800"
                                       >
                                         <div className="h-5 w-5 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                            <CheckCircle2 size={12} />
                                         </div>
                                         {action}
                                       </motion.li>
                                     ))}
                                  </ul>
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                 <div className="p-5 rounded-2xl bg-green-50 border border-green-100 flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center"><Mail size={16}/></div>
                                   <div className="text-[10px] font-black uppercase text-green-700">Email Draft Ready</div>
                                 </div>
                                 <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center"><Zap size={16}/></div>
                                   <div className="text-[10px] font-black uppercase text-amber-700">Owners Assigned</div>
                                 </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                   </div>
                </div>
             </motion.div>
          </section>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl font-black md:text-5xl text-slate-900 tracking-tight">Full-Cycle Meeting Intelligence</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto font-medium">Enterprise tools packed into a frictionless experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="h-6 w-6" />}
              title="AI Summarization"
              description="Get instant, accurate summaries of long transcripts without missing critical details."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Task Extraction"
              description="Automatically detect action items, owners, and deadlines with surgical precision."
            />
            <FeatureCard 
              icon={<Layout className="h-6 w-6" />}
              title="Smart Organization"
              description="Keep all your meetings categorized and searchable in a beautiful, unified workspace."
            />
            <FeatureCard 
              icon={<Mail className="h-6 w-6" />}
              title="Follow-up Drafts"
              description="Generate ready-to-send follow-up emails based on meeting outcomes instantly."
            />
            <FeatureCard 
              icon={<Share2 className="h-6 w-6" />}
              title="Multi-format Export"
              description="Export results to PDF, Word, or CSV to share with your team effortlessly."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />}
              title="Enterprise Security"
              description="Your data is encrypted and protected with industry-standard security protocols."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 bg-white px-6">
          <div className="mx-auto max-w-7xl">
             <div className="text-center mb-16 px-4">
                <h2 className="text-3xl font-black md:text-5xl tracking-tight">Transparent Scaling</h2>
                <p className="mt-4 text-slate-500 font-medium">From solo analysts to global enterprises.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <PricingCard 
                   title="Free"
                   price="$0"
                   description="Perfect for individuals testing the waters."
                   features={["5 documents/month", "Standard AI speed", "PDF Export"]}
                />
                <PricingCard 
                   title="Pro"
                   price="$9"
                   description="Best for power users and professionals."
                   features={["Unlimited processing", "High-priority AI", "Premium Exports", "Cloud History"]}
                   highlight
                />
                <PricingCard 
                   title="Team"
                   price="$29"
                   description="Designed for high-growth companies."
                   features={["Shared Workspace", "Team Collaboration", "Admin Controls", "Custom Branding"]}
                />
             </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-900 border-t border-slate-800 text-center px-6">
        <div className="mx-auto max-w-4xl">
           <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-8">Ready to reclaim your time?</h2>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-16 w-full sm:w-auto rounded-2xl bg-amber-500 px-10 text-base font-extrabold hover:bg-amber-600 shadow-2xl shadow-amber-500/20">
                <Link to="/login">Get NoteGenius Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 w-full sm:w-auto rounded-2xl border-slate-700 text-white hover:bg-white/5 font-bold">
                 Contact Sales
              </Button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-16 bg-white px-6">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">NoteGenius</span>
            </Link>
            <p className="text-slate-400 font-medium max-w-xs leading-relaxed">
              The world's most advanced meeting documentation platform powered by generative intelligence.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Product</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-500">
              <li><a href="#" className="hover:text-amber-500 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Enterprise</a></li>
            </ul>
          </div>
          <div className="space-y-4 text-right md:text-left">
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-900">Company</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-500">
              <li><a href="#" className="hover:text-amber-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-slate-400">© 2026 NoteGenius AI. Built with precision.</p>
          <div className="flex gap-6 text-slate-300">
             <a href="#" className="hover:text-amber-500 transition-colors"><Globe size={18} /></a>
             <a href="#" className="hover:text-amber-500 transition-colors"><Zap size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group p-10 rounded-[40px] bg-white border border-slate-100 hover:border-amber-200 transition-all hover:shadow-[0_32px_64px_-16px_rgba(245,158,11,0.1)]"
    >
      <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm font-medium">{description}</p>
    </motion.div>
  );
}

function PricingCard({ title, price, description, features, highlight = false }: { title: string, price: string, description: string, features: string[], highlight?: boolean }) {
  return (
    <div className={`p-10 rounded-[40px] border transition-all ${highlight ? 'border-amber-500 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] md:scale-105 z-10' : 'border-slate-100 bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
         <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{title}</h3>
         {highlight && <span className="bg-amber-500 text-white text-[9px] uppercase font-black py-1 px-3 rounded-full">Primary</span>}
      </div>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-5xl font-black tracking-tighter text-slate-900">{price}</span>
        <span className="text-slate-400 text-sm font-bold">/mo</span>
      </div>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed font-bold italic">{description}</p>
      <div className="space-y-4 mb-10">
        {features.map((f, i) => (
          <div key={i} className="flex gap-4 text-sm text-slate-600 items-start">
            <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <span className="font-bold">{f}</span>
          </div>
        ))}
      </div>
      <Button className={`w-full h-16 rounded-2xl font-black transition-all text-base ${highlight ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-100' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
        Get {title}
      </Button>
    </div>
  );
}
