import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { auth, db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  Brain, FileText, CheckCircle2, TrendingUp, 
  Activity, Zap, Clock 
} from "lucide-react";
import { motion } from "motion/react";

export default function Insights() {
  const [stats, setStats] = useState({
    totalMeetings: 0,
    totalTasks: 0,
    completedTasks: 0,
    avgSentiment: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!auth.currentUser) return;
      
      const meetingsSnap = await getDocs(query(collection(db, "meetings"), where("userId", "==", auth.currentUser.uid)));
      const tasksSnap = await getDocs(query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid)));
      
      const completed = tasksSnap.docs.filter(d => d.data().completed).length;
      
      setStats({
        totalMeetings: meetingsSnap.size,
        totalTasks: tasksSnap.size,
        completedTasks: completed,
        avgSentiment: 85 // Mocked for demo since sentiment isn't consistently numerical in DB
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Mon", count: 2 },
    { name: "Tue", count: 4 },
    { name: "Wed", count: 3 },
    { name: "Thu", count: 7 },
    { name: "Fri", count: 5 },
    { name: "Sat", count: 1 },
    { name: "Sun", count: 0 },
  ];

  const pieData = [
    { name: "High", value: 40 },
    { name: "Medium", value: 45 },
    { name: "Low", value: 15 },
  ];
  
  const COLORS = ['#F59E0B', '#FCD34D', '#FEF3C7'];

  return (
    <div className="flex min-h-screen bg-black font-sans text-cyan-400">
      <div className="crt-scanline"></div>
      <Sidebar docCount={stats.totalMeetings} />
      
      <main className="flex-1 p-10 overflow-y-auto relative">
        <header className="mb-12">
          <h1 className="text-3xl font-pixel uppercase tracking-widest text-white glitch-text mb-3">Core_Intelligence</h1>
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">Visual analytics and neural throughput monitoring.</p>
        </header>

        <div className="grid grid-cols-4 gap-6 mb-12">
          <StatCard label="DATA_NODES" value={stats.totalMeetings} icon={<FileText size={20} />} color="border-zinc-800 text-zinc-500" />
          <StatCard label="ACTION_STRINGS" value={stats.totalTasks} icon={<Brain size={20} />} color="border-cyan-400 text-cyan-400" />
          <StatCard label="SYNTAX_COMPLETE" value={`${Math.round((stats.completedTasks/stats.totalTasks) * 100 || 0)}%`} icon={<CheckCircle2 size={20} />} color="border-magenta-500 text-magenta-500" />
          <StatCard label="NEURAL_CONFIDENCE" value={`${stats.avgSentiment}%`} icon={<Zap size={20} />} color="border-zinc-700 text-white" />
        </div>

        <div className="grid grid-cols-3 gap-10">
          <Card className="col-span-2 rounded-none border-2 border-zinc-900 bg-zinc-950 p-6 shadow-[10px_10px_0px_#000]">
            <CardHeader className="p-0 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-pixel uppercase tracking-widest text-white">Throughput_History</CardTitle>
                  <p className="text-[10px] text-zinc-600 font-mono uppercase mt-2 tracking-tighter">Daily Signal processing volume metric</p>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] bg-cyan-950/20 border border-cyan-900 px-3 py-1 uppercase">
                  <TrendingUp size={12} /> +12%_SYNTH
                </div>
              </div>
            </CardHeader>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#333', fontSize: 10, fontFamily: 'monospace' }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#00FFFF', fontFamily: 'monospace' }}
                    cursor={{ fill: '#050505' }}
                  />
                  <Bar dataKey="count" fill="#00FFFF" radius={[0, 0, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="rounded-none border-2 border-zinc-900 bg-zinc-950 p-6 shadow-[10px_10px_0px_#000] overflow-hidden relative">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-xl font-pixel uppercase tracking-widest text-white">Class_Weights</CardTitle>
              <p className="text-[10px] text-zinc-600 font-mono uppercase mt-2 tracking-tighter">Task importance distribution</p>
            </CardHeader>
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#00FFFF', '#FF00FF', '#333'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 bottom-0 top-[60px] pointer-events-none flex items-center justify-center flex-col">
                <span className="text-2xl font-pixel text-white leading-none uppercase tracking-widest">DATA</span>
                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em] mt-1">Matrix</span>
              </div>
            </div>
            <div className="space-y-4 mt-10">
               {pieData.map((p, i) => (
                 <div key={p.name} className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 border border-zinc-800" style={{ backgroundColor: ['#00FFFF', '#FF00FF', '#333'][i % 3] }} />
                       <span className="text-[10px] uppercase text-zinc-500 tracking-tight">{p.name}_SIGNAL</span>
                    </div>
                    <span className="text-[10px] text-zinc-700">{p.value}%</span>
                 </div>
               ))}
            </div>
          </Card>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-3 gap-8 mt-12">
           <ActivityMetric icon={<Clock size={16} />} label="Signal_Latency" value="1.2ms" sub="REAL_TIME" />
           <ActivityMetric icon={<Activity size={16} />} label="Packet_Depth" value="128kb/s" sub="UPLINK" />
           <ActivityMetric icon={<Brain size={16} />} label="Core_Driver" value="X-01_GEN" sub="GEMINI_OS" />
        </div>
      </main>
    </div>

  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <Card className="border-none shadow-sm shadow-slate-100 rounded-3xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none mb-1">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    </Card>
  );
}

function ActivityMetric({ icon, label, value, sub }: any) {
  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-3xl shadow-sm shadow-slate-50 border border-slate-50">
       <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
          <div className="flex items-baseline gap-2">
             <span className="text-lg font-bold text-slate-900 tracking-tight">{value}</span>
             <span className="text-[10px] font-medium text-slate-400">{sub}</span>
          </div>
       </div>
    </div>
  )
}
