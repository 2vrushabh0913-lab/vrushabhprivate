import React from "react";
import { Shield, GraduationCap, Book, Link as LinkIcon, Users } from "lucide-react";

export function Logo({ className = "w-8 h-8", textClassName = "font-bold text-xl tracking-tight text-slate-800", showText = true }: { className?: string, textClassName?: string, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${className} bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative flex items-center justify-center p-1`}>
        {/* Simple SVG representation of the 4-quadrant shield logo */}
        <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shield Outline */}
          <path d="M50 5 L10 20 V60 C10 85 50 115 50 115 C50 115 90 85 90 60 V20 L50 5Z" stroke="#0f172a" strokeWidth="6" fill="white" />
          
          {/* Quadrant Lines */}
          <line x1="50" y1="5" x2="50" y2="115" stroke="#0f172a" strokeWidth="4" />
          <line x1="10" y1="45" x2="90" y2="45" stroke="#0f172a" strokeWidth="4" />

          {/* Top Left: Graduation Cap (Blue/Orange) */}
          <g transform="translate(18, 15) scale(0.6)">
             <path d="M5 25 L25 15 L45 25 L25 35 L5 25Z" fill="#1e40af" />
             <path d="M15 28 V35 C15 35 20 40 25 40 C30 40 35 35 35 35 V28" fill="#1e40af" />
             <path d="M45 25 L45 35" stroke="#f59e0b" strokeWidth="2" />
             <circle cx="45" cy="36" r="2" fill="#f59e0b" />
          </g>

          {/* Top Right: Book with 'C' (Orange bg, Blue book) */}
          <rect x="52" y="7" width="36" height="36" fill="#f59e0b" />
          <g transform="translate(56, 12) scale(0.6)">
             <path d="M5 5 H45 V45 H5 V5Z" fill="white" />
             <path d="M25 5 V45" stroke="#1e40af" strokeWidth="2" />
             <text x="25" y="32" fontSize="24" fontWeight="bold" fill="#1e40af" textAnchor="middle">C</text>
          </g>

          {/* Bottom Left: Links (Orange) */}
          <g transform="translate(18, 60) scale(0.7)">
             <rect x="10" y="5" width="20" height="10" rx="5" stroke="#f59e0b" strokeWidth="4" />
             <rect x="10" y="15" width="20" height="10" rx="5" stroke="#f59e0b" strokeWidth="4" />
          </g>

          {/* Bottom Right: Students (Blue) */}
          <g transform="translate(55, 60) scale(0.6)">
             <circle cx="10" cy="15" r="6" fill="#1e40af" />
             <path d="M2 35 C2 25 18 25 18 35 V45 H2 V35Z" fill="#1e40af" />
             <circle cx="35" cy="15" r="6" fill="#1e40af" />
             <path d="M27 35 C27 25 43 25 43 35 V45 H27 V35Z" fill="#1e40af" />
          </g>
        </svg>
      </div>
      {showText && <span className={textClassName}>ClassLink</span>}
    </div>
  );
}
