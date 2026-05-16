import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import MeetingDetail from "./pages/MeetingDetail";
import History from "./pages/History";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/history" 
          element={user ? <History /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/insights" 
          element={user ? <Insights /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings" 
          element={user ? <Settings /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/meeting/:id" 
          element={user ? <MeetingDetail /> : <Navigate to="/login" />} 
        />
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
}
