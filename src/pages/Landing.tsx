import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Globe, Sparkles, ChevronRight, CheckCircle2, ShieldCheck, Database, Layout } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "../components/Logo";

const showcaseItems = [
  {
    icon: Sparkles,
    title: "Dynamic Seating Protocol",
    desc: "Sequential distribution logic that ensures maximum regularity and academic integrity across multiple batches.",
    color: "emerald"
  },
  {
    icon: Layout,
    title: "Bench-Level Precision",
    desc: "Configurable classroom capacities with 1-seat-per-bench enforcement as per university standards.",
    color: "blue"
  },
  {
    icon: ShieldCheck,
    title: "Governance Dashboard",
    desc: "Centralized controls for HODs and Administrators to manage schedules, faculties, and batch allocations.",
    color: "purple"
  },
  {
    icon: Database,
    title: "Instant Batch Verification",
    desc: "Real-time search and filtering for students to locate their examination coordinates instantly.",
    color: "amber"
  }
];

export default function Landing() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (user) navigate("/dashboard");
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseItems.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative font-sans">
      {/* Abstract Background Shapes & Watermark */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -right-48 w-full h-full bg-blue-50 rounded-full blur-3xl opacity-40 translate-y-[-50%]" />
        
        {/* Large Watermark Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
          <Logo className="w-[800px] h-[800px]" showText={false} />
        </div>
      </div>

      <header className="fixed top-0 w-full z-50 px-4 md:px-8 h-20 md:h-24 flex items-center justify-between backdrop-blur-sm">
        <Logo className="w-10 h-10 md:w-14 md:h-14" textClassName="font-extrabold text-xl md:text-2xl tracking-tighter text-slate-900" />
        <div className="flex items-center gap-3 md:gap-6">
           <button className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors">Documentation</button>
           <button className="bg-slate-900 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200">System Status</button>
        </div>
      </header>
      
      <main className="min-h-screen py-24 w-full flex items-center justify-center relative z-10 px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-12 lg:gap-20">
          <div className="flex-1 text-left hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-brand-primary border border-emerald-100 mb-8"
            >
               <Zap className="w-3 h-3 fill-emerald-500" />
               <span className="text-[10px] font-bold tracking-widest uppercase">Next-Gen Academic Infrastructure</span>
            </motion.div>

            <div className="mb-12">
               <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.85]"
               >
                  ClassLink <br />
                  <span className="text-brand-primary text-2xl md:text-3xl block mt-6 font-bold tracking-normal uppercase opacity-60">Dr. D.Y. Patil College of Engineering and Innovation, Varale</span>
               </motion.h1>
               <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium"
               >
                  Automated examination logistics, dynamic student communication, and smart resource governance. 
               </motion.p>
            </div>

            {/* Sliding Showcase */}
            <div className="relative h-40 max-w-md">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                        {React.createElement(showcaseItems[currentSlide].icon, { className: "w-6 h-6 text-slate-800" })}
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{showcaseItems[currentSlide].title}</h3>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed italic">"{showcaseItems[currentSlide].desc}"</p>
                  </motion.div>
               </AnimatePresence>
               
               <div className="flex gap-2 mt-8">
                  {showcaseItems.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? "w-8 bg-slate-900" : "w-4 bg-slate-200"}`} 
                    />
                  ))}
               </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-md shrink-0"
          >
            <div className="lg:hidden text-center mb-12">
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">ClassLink</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Dr. D.Y. Patil College of Engineering and Innovation, Varale</p>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] relative overflow-hidden">
               {/* Decorative Gradient Accent */}
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-500" />
               
               <div className="flex flex-col items-center mb-6 md:mb-10">
                  <Logo showText={false} className="w-12 h-12 md:w-16 md:h-16 mb-4" />
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight text-center">System Access</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital Gatekeeper</p>
               </div>
               
               <form 
                 onSubmit={async (e) => {
                   e.preventDefault();
                   const formData = new FormData(e.currentTarget);
                   const username = formData.get("username") as string;
                   const password = formData.get("password") as string;
                   const success = await login(username, password);
                   if (!success) {
                      alert("Invalid credentials. Please try again.");
                   }
                 }}
                 className="space-y-4 md:space-y-6"
               >
                  <div className="space-y-2 md:space-y-3 text-left">
                     <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authentication ID</label>
                     <div className="relative group">
                       <input 
                         name="username"
                         type="text"
                         required
                         className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                         placeholder="Enter User ID..."
                       />
                     </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-3 text-left">
                     <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                     <div className="relative group">
                       <input 
                         name="password"
                         type="password"
                         required
                         className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-slate-900 outline-none transition-all text-xs md:text-sm font-bold placeholder:text-slate-300"
                         placeholder="············"
                       />
                     </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 mt-6 group uppercase tracking-widest"
                  >
                    Authorize Access 
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
               </form>

               <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-3 gap-4">
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Admin</p>
                     <p className="text-[10px] text-slate-500 font-mono font-bold bg-slate-50 py-1 rounded">admin</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Student</p>
                     <p className="text-[10px] text-slate-500 font-mono font-bold bg-slate-50 py-1 rounded">1101</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">HOD</p>
                     <p className="text-[10px] text-slate-500 font-mono font-bold bg-slate-50 py-1 rounded">SNM</p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="w-full py-8 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 relative z-50">
         <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center md:text-left">Dr. D.Y. Patil College of Engineering and Innovation, Varale · Academic Year 2026</p>
         <div className="text-center md:text-right">
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Powered by <span className="text-slate-900">CodEngineers</span></p>
            <div className="text-[7px] md:text-[9px] text-slate-400 font-medium leading-tight mt-1">
               <p>Vrushabh Sapkal · Sayali Satre</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
