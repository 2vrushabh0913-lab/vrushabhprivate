import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GovernanceProvider } from "./context/GovernanceContext";
import Layout from "./components/Layout";
import { Logo } from "./components/Logo";

// Lazy pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Seating from "./pages/Seating";
import Classrooms from "./pages/Classrooms";
import Booking from "./pages/Booking";
import Notifications from "./pages/Notifications";
import RollSearch from "./pages/RollSearch";
import Governance from "./pages/Governance";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white gap-6">
      <Logo className="w-24 h-24 animate-pulse" showText={false} />
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest text-center">ClassLink</h2>
        <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest">Dr. D.Y. Patil College of Engineering and Innovation</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <GovernanceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/seating" element={<ProtectedRoute><Seating /></ProtectedRoute>} />
            <Route path="/classrooms" element={<ProtectedRoute><Classrooms /></ProtectedRoute>} />
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><RollSearch /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Governance /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </GovernanceProvider>
    </AuthProvider>
  );
}
