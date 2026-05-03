import React, { useState } from "react";
import { Send, Bell, Trash2, Megaphone, Info, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGovernance } from "../context/GovernanceContext";
import { cn } from "../lib/utils";

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, addNotification, deleteNotification } = useGovernance();
  const [msg, setMsg] = useState("");
  const [targetType, setTargetType] = useState<"division" | "batch" | "individual" | "branch" | "all">("division");
  const [selectedDiv, setSelectedDiv] = useState("A");
  const [selectedBatch, setSelectedBatch] = useState("1");
  const [selectedBranch, setSelectedBranch] = useState("Information Technology");
  const [rollNo, setRollNo] = useState("");
  const [priority, setPriority] = useState(false);
  const [type, setType] = useState("Information");

  const divisions = ["A", "B", "C", "D", "E", "F", "G"];
  const batches = ["1", "2", "3"];
  const branches = ["Computer Engineering", "AI & DS", "AI & ML"];

  const getTargetLabel = () => {
    if (targetType === "division") return `Div ${selectedDiv}`;
    if (targetType === "batch") return `Batch ${selectedDiv}${selectedBatch}`;
    if (targetType === "branch") return selectedBranch;
    if (targetType === "all") return "All Students";
    return `Roll: ${rollNo}`;
  };

  const handleSend = () => {
    const targetIdValue = getTargetLabel();
    if (!msg.trim()) return;
    if (targetType === "individual" && !rollNo.trim()) return;

    addNotification({
      from: user?.displayName || "System",
      type,
      msg,
      priority,
      targetType,
      targetId: targetIdValue
    });

    setMsg("");
    setRollNo("");
    setPriority(false);
    setType("Information");
  };

  const filteredNotifications = notifications.filter(notif => {
    if (user?.role === "student") {
      // All students broadcasts
      if (notif.targetType === "all") return true;

      // Individual target
      if (notif.targetType === "individual") {
        return notif.targetId.includes(user.rollNumber || "");
      }

      // Branch target
      if (notif.targetType === "branch") {
        return notif.targetId === user.branch;
      }

      // Division target
      if (notif.targetType === "division") {
        return notif.targetId === `Div ${user.division}`;
      }

      // Batch target
      if (notif.targetType === "batch") {
        return notif.targetId === `Batch ${user.batch}`;
      }
      
      return false;
    }
    // Faculty/Admin see all
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">System Notifications</h1>
        <p className="text-sm text-slate-500 font-medium italic">Priority communication hub for critical academic intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composition Area */}
        {user?.role !== "student" && (
          <div className="card p-6 space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Megaphone className="w-3.5 h-3.5" /> Notification Dispatch
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Scope</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                {(["division", "batch", "branch", "individual", "all"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTargetType(t)}
                    className={cn(
                      "py-1.5 rounded text-[10px] font-bold uppercase transition-all border",
                      targetType === t 
                        ? "bg-slate-800 text-white border-slate-800" 
                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {targetType === "division" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Division</label>
                  <select 
                    value={selectedDiv}
                    onChange={(e) => setSelectedDiv(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-semibold bg-white"
                  >
                    {divisions.map(d => <option key={d} value={d}>Division {d}</option>)}
                  </select>
                </div>
              )}

              {targetType === "batch" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Division</label>
                    <select 
                      value={selectedDiv}
                      onChange={(e) => setSelectedDiv(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-semibold bg-white"
                    >
                      {divisions.map(d => <option key={d} value={d}>Div {d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Batch</label>
                    <select 
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-semibold bg-white"
                    >
                      {batches.map(b => <option key={b} value={b}>Batch {b}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {targetType === "branch" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Branch</label>
                  <select 
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-semibold bg-white"
                  >
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {targetType === "all" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Broadcast Target</label>
                  <div className="px-3 py-2 rounded border border-green-100 bg-green-50 text-green-700 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Institution Students
                  </div>
                </div>
              )}

              {targetType === "individual" && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Enter Roll No</label>
                  <input 
                    type="text" 
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 1101"
                    className="w-full px-3 py-2 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-semibold"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Priority & Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPriority(!priority)}
                    className={cn(
                      "w-full py-2 rounded text-[10px] font-bold uppercase transition-all border",
                      priority ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 border-slate-100 text-slate-400"
                    )}
                  >
                    {priority ? "Urgent" : "Standard"}
                  </button>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-semibold bg-white"
                  >
                    <option>Information</option>
                    <option>Examination</option>
                    <option>Urgent Alert</option>
                    <option>General News</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
              <textarea 
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Compose notify alert..."
                className="w-full px-3 py-2 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-medium resize-none bg-slate-50/30"
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={!msg.trim() || (targetType === "individual" && !rollNo.trim())}
              className={cn(
                "w-full py-2.5 text-white rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all",
                msg.trim() && (targetType !== "individual" || rollNo.trim()) ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-300 cursor-not-allowed"
              )}
            >
               <Send className="w-3.5 h-3.5" />
               Send Notification
            </button>
          </div>
        )}

        {/* Archive / List */}
        <div className={cn("card flex flex-col overflow-hidden", user?.role === 'student' ? 'lg:col-span-3' : 'lg:col-span-2')}>
           <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Notification Feed</h3>
              {user?.role !== 'student' && <Info className="w-3.5 h-3.5 text-slate-300" />}
           </div>

           <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Notifications</p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div key={item.id} className={cn(
                    "p-4 rounded border transition-all flex gap-4 relative group",
                    item.priority ? "bg-red-50/30 border-red-100 shadow-sm" : "bg-white border-slate-100 hover:border-blue-200"
                  )}>
                    {user?.role !== "student" && (
                      <button 
                        onClick={() => deleteNotification(item.id)}
                        className="absolute top-2 right-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className={cn(
                      "w-10 h-10 rounded flex items-center justify-center flex-shrink-0 border",
                      item.priority ? "bg-red-100 text-red-600 border-red-200" : "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                        <Bell size={18}/>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1 pr-6">
                          <h4 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2">
                            {item.from}
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded tracking-normal normal-case italic font-medium">To {item.targetId}</span>
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400">{item.time}</span>
                        </div>
                        <p className={cn(
                          "text-[11px] font-medium leading-relaxed italic",
                          item.priority ? "text-slate-800" : "text-slate-600"
                        )}>
                          {item.msg}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className={cn(
                            "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                            item.priority ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>{item.type}</div>
                        </div>
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
