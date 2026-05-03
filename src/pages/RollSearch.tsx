import React, { useState } from "react";
import { Search, User, Mail, Hash, BookOpen as Book, GraduationCap, ArrowUpRight, ShieldCheck } from "lucide-react";
import { SEED_STUDENTS } from "../seedData";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

export default function RollSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof SEED_STUDENTS[0] | null>(null);

  const handleSearch = () => {
    const found = SEED_STUDENTS.find(s => s.rollNumber === query);
    setResult(found || null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Student Record Search</h1>
          <p className="text-sm text-slate-500 font-medium italic">Validate student credentials and allocation status.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="card p-1.5 flex items-center bg-white shadow-sm ring-1 ring-slate-200">
           <div className="pl-4">
             <Search className="w-4 h-4 text-slate-300" />
           </div>
           <input 
            type="text" 
            placeholder="Search by Roll Number (e.g. 1101)..."
            className="flex-1 px-4 py-3 outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
           />
           <button 
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-all text-xs font-bold uppercase tracking-widest shadow-sm"
           >
              Execute Query
           </button>
        </div>
      </div>

      {result ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl card overflow-hidden border-blue-200 shadow-blue-50 shadow-lg"
        >
          <div className="h-1 bg-blue-600" />
          
          <div className="p-8">
             <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100 font-bold text-2xl">
                     {result.displayName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 uppercase">{result.displayName}</h2>
                    <div className="flex items-center gap-2 text-blue-600">
                       <ShieldCheck className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Verified Academic Profile</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Academic ID</p>
                   <p className="text-lg font-mono font-bold text-slate-900">#{result.rollNumber}</p>
                </div>
             </div>

              <div className="grid grid-cols-2 gap-8 py-6 mb-8 border-y border-slate-100">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
                   <p className="text-sm font-bold text-slate-800">{result.branch}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allocation</p>
                   <p className="text-sm font-bold text-slate-800">Div {result.division} • Batch {result.batch}</p>
                </div>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Institutional Status: Active</span>
                </div>
                <button className="py-2.5 px-6 border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                   Contact Entity <ArrowUpRight size={12}/>
                </button>
             </div>
          </div>
        </motion.div>
      ) : query && (
        <div className="py-20 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          <Hash size={32} className="mx-auto mb-4 text-slate-200" />
          <p className="text-sm text-slate-400 font-medium italic">Scholar identity {query} is not present in the current index.</p>
        </div>
      )}
    </div>
  );
}
