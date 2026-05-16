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
    <div className="flex min-h-screen bg-[#FBFBFA]">
      <Sidebar docCount={stats.totalMeetings} />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Workspace Insights</h1>
          <p className="text-sm text-gray-500 font-medium">Visual intelligence and productivity analytics.</p>
        </header>

        <div className="grid grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Documents" value={stats.totalMeetings} icon={<FileText size={20} />} color="bg-blue-50 text-blue-600" />
          <StatCard label="Tasks Extracted" value={stats.totalTasks} icon={<Brain size={20} />} color="bg-amber-50 text-amber-600" />
          <StatCard label="Task Completion" value={`${Math.round((stats.completedTasks/stats.totalTasks) * 100 || 0)}%`} icon={<CheckCircle2 size={20} />} color="bg-green-50 text-green-600" />
          <StatCard label="AI Confidence" value={`${stats.avgSentiment}%`} icon={<Zap size={20} />} color="bg-purple-50 text-purple-600" />
        </div>

        <div className="grid grid-cols-3 gap-8">
          <Card className="col-span-2 border-none shadow-sm shadow-slate-100 rounded-3xl p-6 bg-white">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Analysis Frequency</CardTitle>
                  <p className="text-xs text-slate-400 font-medium">Daily AI document processing volume</p>
                </div>
                <div className="flex items-center gap-1 text-green-500 font-bold text-xs bg-green-50 px-2 py-1 rounded-lg">
                  <TrendingUp size={12} /> +12%
                </div>
              </div>
            </CardHeader>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-none shadow-sm shadow-slate-100 rounded-3xl p-6 bg-white overflow-hidden relative">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg font-bold">Priority Distribution</CardTitle>
              <p className="text-xs text-slate-400 font-medium">Extracted task weight class</p>
            </CardHeader>
            <div className="h-[200px] mt-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-x-0 bottom-0 top-[60px] pointer-events-none flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-slate-900 leading-none">Task</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Weights</span>
              </div>
            </div>
            <div className="space-y-3 mt-8">
               {pieData.map((p, i) => (
                 <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                       <span className="text-xs font-bold text-slate-600">{p.name} Priority</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{p.value}%</span>
                 </div>
               ))}
            </div>
          </Card>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-3 gap-6 mt-10">
           <ActivityMetric icon={<Clock size={16} />} label="Response Time" value="1.2s" sub="AI Latency" />
           <ActivityMetric icon={<Activity size={16} />} label="Throughput" value="12mb/m" sub="Network speed" />
           <ActivityMetric icon={<Brain size={16} />} label="NLP Model" value="Gemini 1.5" sub="Core Engine" />
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
