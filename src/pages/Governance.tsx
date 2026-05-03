import React, { useState } from "react";
import { ShieldCheck, Users, GraduationCap, MapPin, BookOpen, Settings, ListPlus, Database, Search, X, Edit2, Trash2, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGovernance } from "../context/GovernanceContext";
import { BRANCH_MAP } from "../constants";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

type EntityType = "faculty" | "student";

export default function Governance() {
  const { user } = useAuth();
  const { faculty, students, subjects, addFaculty, updateFaculty, deleteFaculty, addStudent, updateStudent, deleteStudent, addSubject, updateSubject, deleteSubject } = useGovernance();
  const [activeTab, setActiveTab] = useState<"faculty" | "students" | "batches" | "subjects">("faculty");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [modalType, setModalType] = useState<EntityType | "subject">("faculty");

  if (user?.role !== "admin") return (
    <div className="h-full flex flex-col items-center justify-center text-center p-12">
       <div className="bg-red-50 p-6 rounded-full mb-6">
          <ShieldCheck className="w-12 h-12 text-red-400" />
       </div>
       <h1 className="text-2xl font-black text-slate-900 mb-2 italic">Access Restricted</h1>
       <p className="text-slate-500 font-medium italic">This administrative console requires Tier-1 system credentials. <br/> Your access token level: {user?.role}</p>
    </div>
  );

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.abbr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s => 
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const batchesByDiv = students.reduce((acc, s) => {
    if (!s.division || !s.batch) return acc;
    const key = `${s.division}-${s.batch}`;
    if (!acc[key]) acc[key] = { division: s.division, batch: s.batch, count: 0 };
    acc[key].count++;
    return acc;
  }, {} as Record<string, { division: string, batch: string, count: number }>);

  const filteredBatches = Object.values(batchesByDiv).filter(b => 
    `${b.division}${b.batch}`.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.division.localeCompare(b.division) || a.batch.localeCompare(b.batch));

  const handleOpenModal = (type: EntityType | "subject", entity: any = null) => {
    setModalType(type);
    setEditingEntity(entity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntity(null);
  };

  const handleDelete = (type: EntityType | "subject", id: string) => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === "faculty") deleteFaculty(id);
      else if (type === "student") deleteStudent(id);
      else if (type === "subject") deleteSubject(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">System Governance</h1>
           <p className="text-sm text-slate-500 font-medium italic">Oversee institutional parameters and user permissions.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={() => handleOpenModal("subject")}
             className="bg-white text-slate-600 px-4 py-2 rounded border border-slate-200 shadow-sm font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> + Subject
           </button>
           <button 
             onClick={() => handleOpenModal("student")}
             className="bg-white text-slate-600 px-4 py-2 rounded border border-slate-200 shadow-sm font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> + Student
           </button>
           <button 
             onClick={() => handleOpenModal("faculty")}
             className="bg-slate-800 text-white px-4 py-2 rounded shadow-sm font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5" /> + Faculty
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
         {/* Navigation */}
         <div className="w-full md:w-64 space-y-1">
            <p className="hidden md:block px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Management</p>
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 no-scrollbar">
               {[
                 { id: "faculty", label: "Faculty", icon: GraduationCap },
                 { id: "students", label: "Students", icon: Users },
                 { id: "batches", label: "Batches", icon: BookOpen },
                 { id: "subjects", label: "Curriculum", icon: ListPlus },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={cn(
                     "whitespace-nowrap flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-md text-[10px] md:text-[11px] font-bold uppercase tracking-tight transition-all text-left",
                     activeTab === tab.id 
                       ? "bg-blue-50 text-blue-700 md:border-r-2 border-blue-700" 
                       : "text-slate-600 hover:bg-slate-50"
                   )}
                 >
                   <tab.icon className={cn("w-3 h-3 md:w-4 md:h-4", activeTab === tab.id ? "text-blue-600" : "text-slate-300")} />
                   {tab.label}
                 </button>
               ))}
            </div>

            <div className="hidden md:block pt-8">
               <div className="bg-slate-800 p-6 rounded-lg text-white shadow-sm relative overflow-hidden group border-none">
                  <h4 className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em] mb-4">Infrastructure</h4>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Faculty</span>
                        <span className="text-[10px] font-bold">{faculty.length}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Students</span>
                        <span className="text-[10px] font-bold">{students.length}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Subjects</span>
                        <span className="text-[10px] font-bold">{subjects.length}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Database</span>
                        <span className="bg-green-500 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 card flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
               <h3 className="text-xs font-bold text-slate-800 flex items-center gap-3 capitalize">
                  {activeTab} Registry
               </h3>
               <div className="relative md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search records..."
                    className="w-full pl-9 pr-4 py-1.5 rounded border border-slate-200 outline-none focus:border-blue-500 transition-all text-xs font-semibold"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-x-auto min-h-[440px]">
               {activeTab === 'faculty' && (
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/30">
                       <tr>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Identity</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Abbreviation</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredFaculty.map((f, i) => (
                         <tr 
                           key={i} 
                           className={cn(
                             "hover:bg-slate-50/50 transition-colors group",
                             f.abbr.toUpperCase() === "YDN" && "bg-red-50 hover:bg-red-100/50"
                           )}
                         >
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div>
                                     <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                        {f.name}
                                        {f.abbr.toUpperCase() === "YDN" && (
                                          <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter shadow-sm">HOD</span>
                                        )}
                                     </p>
                                     <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                                        {f.abbr.toUpperCase() === "YDN" ? "Head of Department" : "Professor / Instructor"}
                                     </p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className={cn(
                                 "status-badge font-mono tracking-tighter",
                                 f.abbr.toUpperCase() === "YDN" 
                                   ? "bg-red-600 text-white border-red-700 shadow-sm" 
                                   : "bg-slate-100 text-slate-600 border border-slate-200"
                               )}>
                                 {f.abbr}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleOpenModal("faculty", f)}
                                    className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 transition-all">
                                     <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete("faculty", f.abbr)}
                                    className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition-all">
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               )}

               {activeTab === 'subjects' && (
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/30">
                       <tr>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Subject Name</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">Type</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredSubjects.map((s, i) => (
                         <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                               <p className="text-xs font-bold text-slate-800">{s}</p>
                            </td>
                            <td className="px-6 py-4">
                               <span className="status-badge bg-blue-50 text-blue-600 border border-blue-100 font-bold tracking-tighter scale-90">Core</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleOpenModal("subject", s)}
                                    className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 transition-all">
                                     <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete("subject", s)}
                                    className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition-all">
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               )}

               {activeTab === 'batches' && (
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/30">
                       <tr>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Batch Code</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Division</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Active Count</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredBatches.map((b, i) => (
                         <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                               <p className="text-xs font-bold text-slate-800">Batch {b.batch}</p>
                            </td>
                            <td className="px-6 py-4">
                               <span className="status-badge bg-slate-100 text-slate-600 border border-slate-200 font-bold tracking-tighter">Div {b.division}</span>
                            </td>
                            <td className="px-6 py-4">
                               <p className="text-xs font-bold text-slate-500">{b.count} Students</p>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               )}

               {activeTab === 'students' && (
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/30">
                       <tr>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Student Identity</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Roll / Div</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Branch</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredStudents.map((s, i) => (
                         <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                               <p className="text-xs font-bold text-slate-800">{s.displayName}</p>
                               <p className="text-[9px] text-slate-400 font-mono italic">{s.uid || 'NO-UID'}</p>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-700">{s.rollNumber}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">{s.division} {s.batch}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{s.branch}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleOpenModal("student", s)}
                                    className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 transition-all">
                                     <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete("student", s.rollNumber!)}
                                    className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition-all">
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               )}
            </div>
         </div>
      </div>

      {/* Entity Management Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  {editingEntity ? "Update" : "Register"} {modalType}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                if (modalType === "faculty") {
                  const data = {
                    name: formData.get("name") as string,
                    abbr: formData.get("abbr") as string,
                  };
                  if (editingEntity) updateFaculty(editingEntity.abbr, data);
                  else addFaculty(data);
                } else if (modalType === "subject") {
                  const data = formData.get("name") as string;
                  if (editingEntity) updateSubject(editingEntity, data);
                  else addSubject(data);
                } else {
                  const data = {
                    displayName: formData.get("displayName") as string,
                    rollNumber: formData.get("rollNumber") as string,
                    division: formData.get("division") as string,
                    batch: formData.get("batch") as string,
                    branch: formData.get("branch") as string,
                  };
                  if (editingEntity) updateStudent(editingEntity.rollNumber, data);
                  else addStudent(data);
                }
                handleCloseModal();
              }} className="p-6 space-y-4">
                {modalType === "faculty" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                      <input 
                        name="name"
                        defaultValue={editingEntity?.name}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all text-sm font-semibold"
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Abbreviation</label>
                      <input 
                        name="abbr"
                        defaultValue={editingEntity?.abbr}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all font-mono text-sm"
                        placeholder="JDOE"
                      />
                    </div>
                  </>
                )}

                {modalType === "subject" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject Name</label>
                    <input 
                      name="name"
                      defaultValue={editingEntity}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all text-sm font-semibold"
                      placeholder="e.g. Data Structures"
                    />
                  </div>
                )}

                {modalType === "student" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Name</label>
                      <input 
                        name="displayName"
                        defaultValue={editingEntity?.displayName}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all text-sm font-semibold"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Roll Number</label>
                        <input 
                          name="rollNumber"
                          defaultValue={editingEntity?.rollNumber}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all text-sm"
                          placeholder="1234"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Division</label>
                        <select 
                          name="division"
                          defaultValue={editingEntity?.division || "A"}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all text-sm font-bold"
                        >
                          {["A", "B", "C", "D", "E", "F", "G"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Batch</label>
                        <input 
                          name="batch"
                          defaultValue={editingEntity?.batch}
                          required
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all text-sm uppercase"
                          placeholder="A1"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Branch</label>
                        <select 
                          name="branch"
                          defaultValue={editingEntity?.branch || BRANCH_MAP["A"]}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-600 outline-none transition-all text-sm font-bold"
                        >
                          {Array.from(new Set(Object.values(BRANCH_MAP))).map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                    {editingEntity ? "Commit Changes" : "Confirm Registration"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
