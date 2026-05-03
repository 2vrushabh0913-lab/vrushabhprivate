import React, { useState } from "react";
import { 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Tag as TagIcon,
  Filter,
  CheckCircle2,
  Calendar,
  MoreVertical,
  X,
  Target,
  BookOpen,
  Trash2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGovernance } from "../context/GovernanceContext";
import { INITIAL_CLASSROOMS } from "../constants";
import { cn } from "../lib/utils";

const TIME_SLOTS = [
  "09:15 - 10:15",
  "10:15 - 11:15",
  "11:30 - 12:30",
  "12:30 - 01:30",
  "02:15 - 03:15",
  "03:15 - 04:15",
  "09:15 - 11:15 (Lab)",
  "11:30 - 01:30 (Lab)",
  "02:15 - 04:15 (Lab)"
];

const BOOKING_TYPES = ["Lecture", "Lab Session", "Seminar", "Remedial", "Other"];

export default function Booking() {
  const { user } = useAuth();
  const { subjects, bookings, addBooking, deleteBooking, addNotification } = useGovernance();
  const [selectedRoom, setSelectedRoom] = useState(INITIAL_CLASSROOMS[0].id);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [targetType, setTargetType] = useState<"division" | "batch" | "all">("division");
  const [selectedDiv, setSelectedDiv] = useState("A");
  const [selectedBatch, setSelectedBatch] = useState("1");
  const [subject, setSubject] = useState(subjects[0] || "");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [type, setType] = useState(BOOKING_TYPES[0]);

  const activeRoom = INITIAL_CLASSROOMS.find(r => r.id === selectedRoom);

  const divisions = ["A", "B", "C", "D", "E", "F", "G"];
  const batches = ["1", "2", "3"];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;

    const targetId = targetType === "division" ? `Div ${selectedDiv}` : 
                     targetType === "batch" ? `Batch ${selectedDiv}${selectedBatch}` : 
                     "All Students";

    const bookingData = {
      roomId: activeRoom.id,
      roomNumber: activeRoom.roomNumber,
      facultyName: user?.displayName || "Faculty",
      facultyAbbr: (user?.displayName?.split(' ').map(n => n[0]).join('') || "FAC"),
      subject,
      timeSlot,
      date: new Date().toISOString().split('T')[0],
      targetType,
      targetId,
      type
    };

    addBooking(bookingData);

    // Auto-notify students
    addNotification({
      from: user?.displayName || "Faculty",
      type: "Examination",
      msg: `${type} scheduled in Room ${activeRoom.roomNumber} for ${subject} at ${timeSlot}.`,
      priority: true,
      targetType,
      targetId
    });

    setShowForm(false);
  };

  const roomBookings = bookings.filter(b => b.roomId === selectedRoom);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Space Allocation</h1>
          <p className="text-sm text-slate-500 font-medium italic">Monitor facility utilization and coordinate group bookings.</p>
        </div>
        
        {user?.role !== "student" && (
          <button 
            onClick={() => setShowForm(true)}
            className="text-xs font-semibold bg-slate-800 text-white px-5 py-2.5 rounded shadow-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
             <Plus className="w-3.5 h-3.5" />
             New Booking
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Facility</h3>
              <Filter className="w-3 h-3 text-slate-300" />
            </div>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1 lg:space-y-1 lg:max-h-[400px] lg:overflow-y-auto no-scrollbar lg:pr-1">
              {INITIAL_CLASSROOMS.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={cn(
                    "whitespace-nowrap lg:whitespace-normal w-auto lg:w-full text-left px-3 py-2 rounded text-[10px] md:text-xs font-semibold transition-all flex items-center justify-between group gap-4",
                    selectedRoom === room.id 
                      ? "bg-blue-50 text-blue-700 lg:border-r-2 border-blue-700" 
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <MapPin className={cn("w-3 h-3 md:w-3.5 md:h-3.5", selectedRoom === room.id ? "text-blue-500" : "text-slate-300")} />
                    <div className="flex flex-col">
                      <span>{room.roomNumber}</span>
                      {room.name && <span className="text-[8px] md:text-[9px] text-slate-400 -mt-1 hidden md:block">{room.name}</span>}
                    </div>
                  </div>
                  <ChevronRight className={cn("hidden lg:block w-3.5 h-3.5 transition-transform group-hover:translate-x-1", selectedRoom === room.id ? "text-blue-700" : "text-slate-300")} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg text-white shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
                <TagIcon className="w-5 h-5 text-blue-400 mb-3" />
                <h4 className="text-xs font-bold mb-1">System Suggestion</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Looking for &gt;40 capacity? <br/> <span className="text-blue-300">Room A210</span> is available at 11:30 AM.</p>
             </div>
          </div>
        </div>

        {/* Schedule View */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 flex-shrink-0">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800 italic">
                  {activeRoom?.roomNumber} {activeRoom?.name && `• ${activeRoom.name}`} Overview
                </h2>
                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  <span>Capacity: {activeRoom?.capacity}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                  <span>Floor: {activeRoom?.floor}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Active Space Reservations</h3>
            
            {roomBookings.length === 0 ? (
              <div className="card p-12 text-center">
                <Clock className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active bookings for this room</p>
                <p className="text-[10px] text-slate-400 mt-1 italic">Faculty can initiate new reservations using the top-right console.</p>
              </div>
            ) : (
              roomBookings.map((item) => (
                <div key={item.id} className={cn(
                  "card p-5 group hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                  "border-l-4 border-l-blue-500 shadow-sm"
                )}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded shadow-sm flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors uppercase tracking-tight flex items-center gap-2">
                        {item.type}
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded tracking-normal">To {item.targetId}</span>
                      </h4>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[11px] font-medium text-slate-500">{item.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[11px] font-medium text-slate-500">{item.facultyName} • {item.subject}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                    <span className="status-badge scale-90 bg-blue-50 text-blue-600 border-blue-100">Confirmed</span>
                    {user?.role !== "student" && (
                      <button 
                        onClick={() => deleteBooking(item.id)}
                        className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Plus size={18} />
                </div>
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">New Reservation: {activeRoom?.roomNumber}</h2>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Target size={12} className="text-blue-500" /> Targeted Group
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(["division", "batch", "all"] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTargetType(t)}
                      className={cn(
                        "py-1.5 rounded text-[10px] font-bold uppercase transition-all border",
                        targetType === t ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {targetType === "division" && (
                  <select 
                    value={selectedDiv}
                    onChange={(e) => setSelectedDiv(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-blue-500"
                  >
                    {divisions.map(d => <option key={d} value={d}>Division {d}</option>)}
                  </select>
                )}

                {targetType === "batch" && (
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={selectedDiv}
                      onChange={(e) => setSelectedDiv(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-blue-500"
                    >
                      {divisions.map(d => <option key={d} value={d}>Div {d}</option>)}
                    </select>
                    <select 
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-blue-500"
                    >
                      {batches.map(b => <option key={b} value={b}>Batch {b}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Subject</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-blue-500"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Session Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-blue-500"
                  >
                    {BOOKING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Time Slot (Synced)</label>
                <select 
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-blue-500"
                >
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
              >
                Confirm Reservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

