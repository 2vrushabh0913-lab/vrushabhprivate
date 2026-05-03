import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getBranchName(division: string): string {
  const div = division.toUpperCase();
  if (["A", "B", "C"].includes(div)) return "Computer Engineering";
  if (["D", "E"].includes(div)) return "AI & DS";
  if (["F", "G"].includes(div)) return "AI & ML";
  return "General Engineering";
}
