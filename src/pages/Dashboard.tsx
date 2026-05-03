import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  ArrowUpRight,
  Plus,
  AlertCircle,
  Clock,
  Zap,
  BookOpen,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGovernance } from "../context/GovernanceContext";
import { motion } from "motion/react";
import { INITIAL_CLASSROOMS, DIVISION_A_SCHEDULE, DIVISION_B_SCHEDULE, DIVISION_C_SCHEDULE, DIVISION_D_SCHEDULE, DIVISION_E_SCHEDULE, DIVISION_F_SCHEDULE, DIVISION_G_SCHEDULE } from "../constants";
import { parseTime, getCurrentMinutesFromMidnight } from "../lib/timeUtils";

export default function Dashboard() {
  const { user } = useAuth();
  const { students, notifications } = useGovernance();
  const navigate = useNavigate();
  
  const schedules = {
    A: DIVISION_A_SCHEDULE,
    B: DIVISION_B_SCHEDULE,
    C: DIVISION_C_SCHEDULE,
    D: DIVISION_D_SCHEDULE,
    E: DIVISION_E_SCHEDULE,
    F: DIVISION_F_SCHEDULE,
    G: DIVISION_G_SCHEDULE,
  };

  const [selectedDivision, setSelectedDivision] = React.useState<keyof typeof schedules>(() => {
    if (user?.role === "student" && user.division) {
      return user.division as keyof typeof schedules;
    }
    return "A";
  });
  
  const [selectedDay, setSelectedDay] = React.useState<string>(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = days[new Date().getDay()];
    return schedules[selectedDivision][day] ? day : "Monday";
  });

  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getLiveStatus = (timeRange: string) => {
    if (timeRange === "—") return "none";
    const { start, end } = parseTime(timeRange);
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    if (now >= start && now < end) return "ongoing";
    if (now < start) {
      if (start - now <= 30) return "soon";
      return "upcoming";
    }
    return "past";
  };

  // Find user's specific items today
  const getPersonalItems = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[currentTime.getDay()];
    
    if (user?.role === "student") {
      const div = user.division as keyof typeof schedules;
      return schedules[div]?.[today] || [];
    }
    
    if (user?.role === "teacher" || (user?.role === "admin" && user.facultyAbbreviation)) {
      const abbr = user.facultyAbbreviation;
      const allDivisions = Object.keys(schedules) as (keyof typeof schedules)[];
      let myItems: any[] = [];
      
      allDivisions.forEach(div => {
        const daySchedule = schedules[div][today] || [];
        daySchedule.forEach(item => {
          if (item.teacher === abbr) {
            myItems.push({ ...item, division: div });
          }
        });
      });
      // Sort by time
      return myItems.sort((a, b) => {
        const tA = parseTime(a.time).start;
        const tB = parseTime(b.time).start;
        return tA - tB;
      });
    }

    return [];
  };

  const personalToday = getPersonalItems();
  const ongoing = personalToday.filter(item => getLiveStatus(item.time) === "ongoing");
  const upcoming = personalToday.filter(item => getLiveStatus(item.time) === "soon" || getLiveStatus(item.time) === "upcoming");

  const stats = [
    { label: "Total Students", value: students.length.toString(), icon: Users, color: "text-blue-600" },
    { label: "Active Classrooms", value: INITIAL_CLASSROOMS.length.toString(), icon: MapPin, color: "text-emerald-600" },
    { label: "Scheduled Today", value: personalToday.length.toString(), icon: Calendar, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-lg p-8 relative overflow-hidden text-white shadow-sm border-none">
         <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-100 mb-2">Institutional Dashboard</h2>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Welcome Back, {user?.displayName}
                </h1>
                <p className="text-blue-100 max-w-xl text-sm font-medium opacity-90 pr-4">
                  {user?.role === 'student' 
                    ? `Division ${user.division} · Batch ${user.batch} · ${user.branch}`
                    : `Faculty Member · ${user?.facultyAbbreviation || 'Admin'}`}
                </p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-2xl font-mono font-bold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">{selectedDay}</p>
              </div>
            </div>
         </div>
      </div>

      {/* Live Sync Row */}
      {(ongoing.length > 0 || upcoming.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ongoing.map((item, idx) => (
            <motion.div 
              key={`ongoing-${idx}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-center gap-5 shadow-sm"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse shrink-0">
                 <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Ongoing Now</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-500">{item.time}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{item.subject}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    {user?.role === 'student' ? <UserIcon className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {user?.role === 'student' ? item.teacher : item.room}
                  </p>
                  {item.batch && <span className="text-[9px] font-bold text-emerald-600 uppercase">Batch {item.batch}</span>}
                  {item.division && <span className="text-[9px] font-bold text-emerald-600 uppercase">Div {item.division}</span>}
                </div>
              </div>
            </motion.div>
          ))}

          {upcoming.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center gap-5 shadow-sm"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                 <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Upcoming Next</span>
                  <span className="text-[10px] font-mono font-bold text-blue-500">{upcoming[0].time}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{upcoming[0].subject}</h3>
                <div className="flex items-center gap-3 mt-1">
                   <p className="text-xs text-slate-600 flex items-center gap-1">
                    {user?.role === 'student' ? <UserIcon className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {user?.role === 'student' ? upcoming[0].teacher : upcoming[0].room}
                  </p>
                  {upcoming[0].batch && <span className="text-[9px] font-bold text-blue-600 uppercase">Batch {upcoming[0].batch}</span>}
                  {upcoming[0].division && <span className="text-[9px] font-bold text-blue-600 uppercase">Div {upcoming[0].division}</span>}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {stats.map((s, i) => (
           <motion.div 
             key={s.label}
             initial={{ opacity: 0, y: 5 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="card p-6 flex flex-col"
           >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                <div className={`p-2 rounded-md bg-slate-50 ${s.color}`}>
                   <s.icon className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-3xl font-bold text-slate-900">{s.value}</h4>
              <p className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">
                 System synchronized <CheckCircle2 className="w-2.5 h-2.5" />
              </p>
           </motion.div>
         ))}
      </div>

      {/* Primary Actions / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card flex flex-col">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                   <Calendar className="w-3 h-3 text-blue-600" /> Schedule Explorer
                 </h3>
                 <div className="flex bg-slate-100 rounded p-0.5 overflow-x-auto max-w-full overflow-y-hidden no-scrollbar">
                    {(["A", "B", "C", "D", "E", "F", "G"] as const).map(div => (
                      <button 
                        key={div}
                        onClick={() => setSelectedDivision(div)}
                        className={`px-3 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${selectedDivision === div ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        DIV {div}
                      </button>
                    ))}
                 </div>
               </div>
               
               <div className="flex bg-slate-100 rounded-md p-0.5 overflow-x-auto max-w-full overflow-y-hidden no-scrollbar">
                  {Object.keys(schedules[selectedDivision]).map(day => (
                    <button 
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1 text-[9px] font-bold rounded transition-all whitespace-nowrap ${selectedDay === day ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
               </div>
            </div>

            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
               {schedules[selectedDivision][selectedDay]?.map((item, i) => {
                 const status = getLiveStatus(item.time);
                 const isPersonal = user?.role === 'student' && user.division === selectedDivision;
                 const isOngoing = status === 'ongoing';

                 return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded border transition-all ${
                    isOngoing ? 'border-emerald-200 bg-emerald-50/50 ring-1 ring-emerald-100' : 
                    item.type === 'Break' ? 'bg-amber-50/30 border-amber-100 opacity-60' : 
                    'border-slate-100 bg-slate-50/50 hover:border-blue-200 group'
                  }`}>
                      <div className="flex items-center gap-4">
                        <div className={`text-[10px] font-mono font-bold w-24 flex items-center gap-1.5 ${isOngoing ? 'text-emerald-600' : 'text-slate-400'}`}>
                           <Clock className="w-2.5 h-2.5" />
                           {item.time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">{item.subject}</p>
                            {item.batch && (
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">
                                {item.batch}
                              </span>
                            )}
                            {isOngoing && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {item.type !== 'Break' && (
                              <>
                                {user?.role === 'student' ? (
                                  <>
                                    {item.teacher && <span>{item.teacher}</span>}
                                    {item.room && <span> · {item.room}</span>}
                                  </>
                                ) : (
                                  <>
                                    {item.room && <span>{item.room}</span>}
                                    {item.teacher && <span> · {item.teacher}</span>}
                                  </>
                                )}
                                <span> · </span>
                              </>
                            )}
                            {item.type}
                          </p>
                        </div>
                      </div>
                      {item.type !== 'Break' && (
                        <ArrowUpRight className={`w-4 h-4 transition-colors ${isOngoing ? 'text-emerald-500' : 'text-slate-300 group-hover:text-blue-600'}`} />
                      )}
                  </div>
                 );
               })}
            </div>
          </div>

          <div className="space-y-6">
            {/* Faculty Specific / Student Specific Quick Box */}
            <div className="card p-5 bg-slate-900 text-white">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Personal Track</h3>
                  <BookOpen className="w-4 h-4 text-blue-400" />
               </div>
               <div className="space-y-4">
                  {personalToday.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No classes scheduled for you today.</p>
                  ) : (
                    personalToday.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
                         <div>
                            <p className="text-xs font-bold">{item.subject}</p>
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 px-0">
                               {user?.role === 'student' ? item.teacher : `Div ${item.division} · ${item.room}`}
                            </p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-mono text-blue-400">{item.time.split(' - ')[0]}</p>
                            <p className="text-[9px] uppercase font-bold text-slate-500">{getLiveStatus(item.time)}</p>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>

            <div className="card flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-blue-500" /> Recent Notifications
                </h3>
                <button 
                  onClick={() => navigate("/notifications")}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="p-4 space-y-4">
                {notifications.filter(notif => {
                  if (user?.role === "student") {
                    if (notif.targetType === "all") return true;
                    if (notif.targetType === "individual") return notif.targetId.includes(user.rollNumber || "");
                    if (notif.targetType === "branch") return notif.targetId === user.branch;
                    if (notif.targetType === "division") return notif.targetId === `Div ${user.division}`;
                    if (notif.targetType === "batch") return notif.targetId === `Batch ${user.batch}`;
                    return false;
                  }
                  return true;
                }).length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic text-center py-4">No relevant notifications</p>
                ) : (
                  notifications
                    .filter(notif => {
                      if (user?.role === "student") {
                        if (notif.targetType === "all") return true;
                        if (notif.targetType === "individual") return notif.targetId.includes(user.rollNumber || "");
                        if (notif.targetType === "branch") return notif.targetId === user.branch;
                        if (notif.targetType === "division") return notif.targetId === `Div ${user.division}`;
                        if (notif.targetType === "batch") return notif.targetId === `Batch ${user.batch}`;
                        return false;
                      }
                      return true;
                    })
                    .slice(0, 3)
                    .map((item) => (
                      <div key={item.id} className="flex gap-3">
                          <div className={`w-1 rounded-full shrink-0 ${item.priority ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[10px] font-bold text-slate-700 truncate">{item.from}</p>
                              <p className="text-[9px] text-slate-400 whitespace-nowrap">{item.time}</p>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 italic">{item.msg}</p>
                          </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
