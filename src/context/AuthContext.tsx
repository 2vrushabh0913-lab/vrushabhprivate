import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProfile, UserRole } from "../types";
import { SEED_STUDENTS } from "../seedData";
import { INITIAL_FACULTY } from "../constants";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock persistence for now
  useEffect(() => {
    const saved = localStorage.getItem("classlink_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("classlink_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Admin check
    if (username.toLowerCase() === "admin" && (password === "admin123" || password === "123")) {
      const adminUser: UserProfile = {
        uid: "admin-uid",
        email: "admin@dypcoei.edu.in",
        displayName: "System Administrator",
        role: "admin",
      };
      setUser(adminUser);
      localStorage.setItem("classlink_user", JSON.stringify(adminUser));
      return true;
    }

    // Student check (Roll Number)
    const student = SEED_STUDENTS.find(s => s.rollNumber === username);
    if (student && password === username) {
      const studentUser: UserProfile = {
        uid: `student-${student.rollNumber}`,
        email: `${student.rollNumber}@dypcoei.edu.in`,
        displayName: student.displayName || "Student",
        role: "student",
        division: student.division,
        rollNumber: student.rollNumber,
        branch: student.branch,
        batch: student.batch
      };
      setUser(studentUser);
      localStorage.setItem("classlink_user", JSON.stringify(studentUser));
      return true;
    }

    // Faculty check (Abbreviation or Name)
    const faculty = INITIAL_FACULTY.find(f => 
      f.abbr.toLowerCase() === username.toLowerCase() || 
      f.name.toLowerCase() === username.toLowerCase()
    );

    if (faculty && (password.toLowerCase() === username.toLowerCase() || password.toLowerCase() === faculty.abbr.toLowerCase())) {
      // Special case for HOD - give admin powers
      const isAdmin = faculty.abbr.toUpperCase() === "YDN";
      
      const teacherUser: UserProfile = {
        uid: `teacher-${faculty.abbr}`,
        email: `${faculty.abbr.toLowerCase()}@dypcoei.edu.in`,
        displayName: faculty.name,
        role: isAdmin ? "admin" : "teacher",
        facultyAbbreviation: faculty.abbr
      };
      setUser(teacherUser);
      localStorage.setItem("classlink_user", JSON.stringify(teacherUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("classlink_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
