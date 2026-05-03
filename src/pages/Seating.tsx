import React, { useState, useEffect } from "react";
import { 
  Users, 
  MapPin, 
  BookOpen, 
  Plus, 
  Download, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Printer,
  CheckSquare,
  Square,
  Search,
  User,
  ArrowRight,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { INITIAL_CLASSROOMS, BRANCH_MAP } from "../constants";
import { SEED_STUDENTS } from "../seedData";
import { generateSeating } from "../lib/seatingArrangement";
import { SeatingArrangement, UserProfile } from "../types";
import { cn } from "../lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function Seating() {
  const { user } = useAuth();
  const [sessionName, setSessionName] = useState("External Examination 2026");
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [roomCapacities, setRoomCapacities] = useState<Record<string, number>>(
    INITIAL_CLASSROOMS.reduce((acc, room) => ({ ...acc, [room.id]: room.capacity }), {})
  );
  const [arrangements, setArrangements] = useState<SeatingArrangement[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch current seating on mount and periodically
  const fetchSeating = async () => {
    try {
      const res = await fetch("/api/seating");
      const data = await res.json();
      setArrangements(data.arrangements || []);
      setSessionName(data.sessionName || "External Examination 2026");
    } catch (err) {
      console.error("Failed to fetch seating", err);
    }
  };

  useEffect(() => {
    fetchSeating();
    // Refresh every 5 seconds for real-time vibe
    const interval = setInterval(fetchSeating, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const pool = SEED_STUDENTS.filter(s => selectedDivisions.includes(s.division || "")) as UserProfile[];
    const targetRooms = INITIAL_CLASSROOMS
      .filter(r => selectedRooms.includes(r.id))
      .map(r => ({
        ...r,
        capacity: roomCapacities[r.id] || r.capacity
      }));
    
    // Create pool of students based on divisions
    if (pool.length === 0) {
      alert("Please select at least one division with students.");
      setIsGenerating(false);
      return;
    }

    const result = generateSeating(pool, targetRooms, sessionName || "External Examination 2026");
    
    try {
      await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrangements: result, sessionName })
      });
      setArrangements(result);
    } catch (err) {
      console.error("Failed to save seating", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearArrangements = async () => {
    if (!confirm("Are you sure you want to remove ALL current seating arrangements? This will reflect for all students instantly.")) return;
    
    setIsClearing(true);
    try {
      await fetch("/api/seating/clear", { method: "POST" });
      setArrangements([]);
    } catch (err) {
      console.error("Failed to clear seating", err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = sessionName ? `Exam Seating: ${sessionName}` : "Dr. D.Y. Patil College of Engineering and Innovation, Varale";
    
    doc.setFontSize(16);
    doc.text(title, 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Students: ${arrangements.length}`, 14, 35);
    
    const tableData = filteredArrangements.map((a, i) => [
      i + 1,
      a.studentRoll,
      a.studentName,
      a.division,
      a.branch,
      a.roomNumber,
      `Bench ${a.benchNumber} S${a.seatNumber}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Sr', 'Roll', 'Name', 'Div', 'Branch', 'Room', 'Seat']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }, // slate-800
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      margin: { top: 40 },
      didDrawPage: (data) => {
        // Footer
        const str = `Page ${data.pageNumber}`;
        doc.setFontSize(8);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    const fileName = sessionName 
      ? `Seating_${sessionName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      : `Seating_Arrangement_${Date.now()}.pdf`;
      
    doc.save(fileName);
  };

  const handleExportCSV = () => {
    const headers = ["Serial No", "Roll No", "Student Name", "Division", "Branch", "Room Number", "Bench", "Seat"];
    const rows = filteredArrangements.map((a, i) => [
      i + 1,
      a.studentRoll,
      a.studentName,
      a.division,
      a.branch,
      a.roomNumber,
      a.benchNumber,
      a.seatNumber
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const fileName = sessionName 
      ? `Seating_${sessionName.replace(/\s+/g, '_')}.csv`
      : `Seating_Arrangement_${Date.now()}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredArrangements = arrangements.filter(a => 
    a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.studentRoll.includes(searchQuery)
  );

  const myAllocation = arrangements.find(a => a.studentRoll === user?.rollNumber);

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1 md:mb-2">Exam Seating Repository</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Verify examination allocations via Roll Number or Student Identity.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Bar */}
          <div className="relative group w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search Roll No or Name..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-semibold shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {user?.role === "admin" && (
               <>
                 <button 
                    onClick={handleClearArrangements}
                    disabled={isClearing || arrangements.length === 0}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-red-100 text-red-500 px-4 py-2.5 rounded-xl shadow-sm text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50 active:scale-95"
                 >
                    {isClearing ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Clear
                 </button>
                 <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 active:scale-95"
                 >
                    {isGenerating ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Generate
                 </button>
               </>
            )}
            
            <div className="flex items-stretch gap-0.5 w-full md:w-auto">
              <button 
                onClick={handleExportPDF}
                disabled={arrangements.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-l-xl shadow-sm text-xs font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all"
                title="Export as PDF"
              >
                  <Printer className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleExportCSV}
                disabled={arrangements.length === 0}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-r-xl shadow-sm text-xs font-bold uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all"
                title="Export as CSV"
              >
                  <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {user?.role === "student" && myAllocation && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl opacity-30" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 text-center lg:text-left">
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 mx-auto lg:mx-0">
                <CheckCircle2 className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Allocation Found</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">Hello, {user.displayName}</h2>
                <p className="text-blue-200/60 font-medium tracking-wide text-xs md:text-sm">Your examination venue has been secured:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 group transition-all hover:bg-white/15">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400 mb-1" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-200/50">Classroom</p>
                <p className="text-2xl md:text-3xl font-black tracking-tighter">{myAllocation.roomNumber}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 group transition-all hover:bg-white/15">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400 mb-1" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-purple-200/50">Bench No</p>
                <p className="text-2xl md:text-3xl font-black tracking-tighter">{myAllocation.benchNumber}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 col-span-1 sm:col-span-2 group transition-all hover:bg-white/15">
                <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-emerald-400 shrink-0" />
                  <div className="text-center sm:text-left">
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-200/50">Session</p>
                    <p className="text-sm md:text-lg font-black tracking-tight">{sessionName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Configuration Panel - Only for Admin */}
        {user?.role === "admin" && (
           <div className="lg:col-span-1 flex flex-col h-fit">
               <div className="card">
                  <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                     <Filter className="w-3.5 h-3.5 text-slate-400" />
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Parameters</h3>
                  </div>
                  
                  <div className="p-6 space-y-6 text-sm">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Session Identifier</label>
                      <input 
                        type="text" 
                        placeholder="SEM II Finals"
                        className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-semibold"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                        Target Divisions
                        <span className="text-[9px] font-normal lowercase text-slate-400">({selectedDivisions.length} selected)</span>
                      </label>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                        {Object.keys(BRANCH_MAP).map(div => (
                          <button
                            key={div}
                            onClick={() => {
                              if (selectedDivisions.includes(div)) {
                                setSelectedDivisions(selectedDivisions.filter(d => d !== div));
                              } else {
                                setSelectedDivisions([...selectedDivisions, div]);
                              }
                            }}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all border group",
                              selectedDivisions.includes(div)
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                            )}
                          >
                            <span>Division {div}</span>
                            {selectedDivisions.includes(div) ? (
                              <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                        Allocated Classrooms
                      </label>
                      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                        {INITIAL_CLASSROOMS.map(room => (
                          <div key={room.id} className="space-y-2">
                             <button
                                onClick={() => {
                                  if (selectedRooms.includes(room.id)) {
                                    setSelectedRooms(selectedRooms.filter(id => id !== room.id));
                                  } else {
                                    setSelectedRooms([...selectedRooms, room.id]);
                                  }
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all border group text-left",
                                  selectedRooms.includes(room.id)
                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                                )}
                             >
                                <div className="flex flex-col items-start leading-none gap-1">
                                  <span>{room.roomNumber}</span>
                                  <span className={cn(
                                    "text-[8px] font-bold uppercase tracking-tight",
                                    selectedRooms.includes(room.id) ? "text-slate-400" : "text-slate-300"
                                  )}>{room.building}</span>
                                </div>
                                {selectedRooms.includes(room.id) ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-300" />
                                )}
                             </button>
                             
                             {selectedRooms.includes(room.id) && (
                               <div className="px-1 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">Current Capacity:</label>
                                  <input 
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={roomCapacities[room.id]}
                                    onChange={(e) => setRoomCapacities(prev => ({ ...prev, [room.id]: parseInt(e.target.value) || 0 }))}
                                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                  />
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
               </div>
           </div>
        )}

        {/* Info Column for Students */}
        {user?.role === "student" && (
           <div className="lg:col-span-1 space-y-6">
              <div className="card p-8 bg-white border-blue-100 relative overflow-hidden group border-none">
                 <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full transition-all group-hover:scale-150" />
                 <div className="relative z-10">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                       <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-3 leading-tight">Campus Venue Navigation</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                       Buildings are marked at entrances. Please arrive at your allocated classroom at least 15 minutes prior to the session start.
                    </p>
                 </div>
              </div>

              <div className="card p-8 bg-slate-900 text-white relative overflow-hidden group border-none">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rotate-45 translate-x-1/2 -translate-y-1/2" />
                 <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                       <BookOpen className="w-6 h-6 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-3 leading-tight">Examination Protocol</h3>
                    <ul className="text-xs space-y-3 text-slate-400 font-bold uppercase tracking-widest">
                       <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> No Digital Devices</li>
                       <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> ID Cards Mandatory</li>
                       <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> Uniform Compliance</li>
                    </ul>
                 </div>
              </div>
           </div>
        )}

        {/* Results / Table */}
        <div className={cn(
          "card flex flex-col overflow-hidden shadow-2xl shadow-slate-200/50 border-none",
          user?.role === "admin" ? "lg:col-span-3" : "lg:col-span-3"
        )}>
          <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div>
                 <h4 className="font-black text-slate-900 text-lg tracking-tight">Full Batch Arrangement</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{sessionName}</p>
               </div>
            </div>
            
            {searchQuery && (
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                Filtered: {filteredArrangements.length} Matches
              </div>
            )}
          </div>

          <div className="flex-1 overflow-x-auto min-h-[440px]">
             {arrangements.length > 0 ? (
               <table className="w-full text-left border-separate border-spacing-0">
                 <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Identity</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Department</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Exam Coordinates</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredArrangements.map((a, i) => {
                      const isMe = a.studentRoll === user?.rollNumber;
                      return (
                        <motion.tr 
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min((i % 20) * 0.02, 0.5) }}
                          key={a.id} 
                          className={cn(
                            "transition-all",
                            isMe ? "bg-blue-50 cursor-default" : "hover:bg-slate-50/50"
                          )}
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all",
                                isMe ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                              )}>
                                {a.studentName[0]}
                              </div>
                              <div>
                                <p className={cn(
                                  "font-black text-sm uppercase tracking-tight",
                                  isMe ? "text-blue-800" : "text-slate-800"
                                )}>{a.studentName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Roll: {a.studentRoll} · DIV {a.division}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex flex-col gap-1">
                               <span className={cn(
                                 "text-[9px] font-black uppercase tracking-widest",
                                 a.branch === "Computer Engineering" ? "text-blue-500" :
                                 a.branch === "AI & DS" ? "text-purple-500" :
                                 "text-amber-500"
                               )}>
                                 {a.branch}
                               </span>
                               <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={cn(
                                    "h-full rounded-full",
                                    a.branch === "Computer Engineering" ? "bg-blue-500 w-full" :
                                    a.branch === "AI & DS" ? "bg-purple-500 w-full" :
                                    "bg-amber-500 w-full"
                                  )} />
                               </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                  "h-12 w-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all border",
                                  isMe ? "bg-white border-blue-200 text-blue-700 shadow-xl" : "bg-slate-50 border-slate-100 text-slate-600"
                                )}>
                                   <span className="text-[10px] opacity-40 leading-none mb-0.5">RM</span>
                                   <span className="text-sm leading-none">{a.roomNumber}</span>
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Position</p>
                                  <p className={cn(
                                    "text-xs font-black tracking-tight uppercase",
                                    isMe ? "text-blue-700" : "text-slate-600"
                                  )}>
                                    Bench {a.benchNumber} <span className="text-slate-300 mx-1">/</span> S-{a.seatNumber}
                                  </p>
                                </div>
                             </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                 </tbody>
               </table>
             ) : (
               <div className="flex flex-col items-center justify-center h-full p-20 text-center bg-white">
                  <BookOpen className="w-12 h-12 text-slate-100 mb-6" />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">Pending session generation by administration.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
