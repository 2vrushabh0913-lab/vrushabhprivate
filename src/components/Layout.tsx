import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Bell, 
  LayoutDashboard, 
  Lock, 
  LogOut,
  ChevronRight,
  Search,
  Settings,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { label: "Insights", icon: LayoutDashboard, path: "/dashboard", roles: ["admin", "teacher", "student"] },
    { label: "Classrooms", icon: MapPin, path: "/classrooms", roles: ["admin", "teacher"] },
    { label: "Booking", icon: Calendar, path: "/booking", roles: ["admin", "teacher", "student"] },
  ];

  const portalItems = [
    { label: "Exam Generator", icon: BookOpen, path: "/seating", roles: ["admin", "student"] },
    { label: "Notifications", icon: Bell, path: "/notifications", roles: ["admin", "teacher", "student"] },
    { label: "Roll Search", icon: Search, path: "/search", roles: ["admin", "teacher"] },
    { label: "Governance", icon: ShieldCheck, path: "/admin", roles: ["admin"] },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 pb-2">
        <Logo className="w-12 h-12" textClassName="font-extrabold text-2xl tracking-tighter text-slate-900" />
      </div>

      <nav className="flex-1 px-4 space-y-4 overflow-y-auto pt-4">
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Navigation</p>
          <div className="space-y-1">
            {navItems.filter(item => item.roles.includes(user?.role || "")).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Portal Access</p>
          <div className="space-y-1">
            {portalItems.filter(item => item.roles.includes(user?.role || "")).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
         <div className="flex flex-col gap-2">
           <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                {user?.displayName?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-slate-800 leading-none">{user?.displayName}</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">{user?.role} Portal</p>
              </div>
           </div>
           <div className="mt-2 px-3 py-2 bg-slate-50/50 rounded-lg border border-slate-100/50">
             <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mb-0.5">made by <span className="text-slate-400 font-bold">CodEngineers</span></p>
             <div className="text-[7px] text-slate-400 font-medium leading-tight">
                <p>dev: Vrushabh Sapkal</p>
                <p className="ml-5">Sayali Satre</p>
             </div>
           </div>
           <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-600 transition-colors text-[10px] font-bold uppercase tracking-widest w-full mt-2"
           >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
           </button>
         </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 md:hidden hover:bg-slate-50 rounded-lg"
             >
               <div className="space-y-1.5">
                  <div className="w-5 h-0.5 bg-slate-600 rounded-full"></div>
                  <div className="w-5 h-0.5 bg-slate-600 rounded-full"></div>
                  <div className="w-3 h-0.5 bg-slate-600 rounded-full"></div>
               </div>
             </button>
             <h2 className="text-sm font-bold text-slate-800 truncate max-w-[150px] md:max-w-none">
                {location.pathname.substring(1).split('/')[0].toUpperCase() || 'DASHBOARD OVERVIEW'}
             </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-4 text-slate-400">
              <button className="hover:text-slate-600 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <button className="hover:text-slate-600 transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
            <div className="hidden sm:block h-4 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
               <div className="bg-blue-50 text-blue-700 px-2 md:px-3 py-1 rounded text-[9px] md:text-[10px] font-bold border border-blue-100 uppercase tracking-tight whitespace-nowrap">
                  Live System
               </div>
               <span className="hidden lg:block text-xs font-medium text-slate-500 whitespace-nowrap">
                 {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
               </span>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
