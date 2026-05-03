import React, { useState } from "react";
import { Plus, MapPin, Layers, Users, Edit3, Trash2, Search, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { INITIAL_CLASSROOMS } from "../constants";
import { cn } from "../lib/utils";

export default function Classrooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState(INITIAL_CLASSROOMS);
  const [search, setSearch] = useState("");

  const filtered = rooms.filter(r => 
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Facility Registry</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Directory of academic labs and lecture halls.</p>
        </div>
        
        {user?.role === "admin" && (
          <button className="text-xs font-semibold bg-slate-800 text-white px-5 py-2.5 rounded shadow-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
             <Plus className="w-3.5 h-3.5" />
             Register Hall
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter list by room ID or block..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-slate-200 outline-none focus:border-blue-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.map((r) => (
           <div key={r.id} className="card p-6 flex flex-col group relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-slate-100 text-slate-700 w-12 h-12 rounded flex items-center justify-center font-bold text-lg border border-slate-200">
                       {r.roomNumber}
                    </div>
                    {user?.role === "admin" && (
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-1">{r.building}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Campus Unit</p>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4">
                   <div className="flex items-center gap-2 text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[10px] font-bold uppercase">Floor {r.floor}</span>
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[10px] font-bold uppercase">{r.capacity} Seats</span>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <span className="status-badge bg-blue-50 text-blue-700 border border-blue-100">
                     {r.type.replace('_', ' ')}
                   </span>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Ready
                   </div>
                </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
