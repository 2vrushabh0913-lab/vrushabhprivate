import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_FACULTY, INITIAL_SUBJECTS } from "../constants";
import { SEED_STUDENTS } from "../seedData";
import { UserProfile } from "../types";

interface Faculty {
  abbr: string;
  name: string;
}

interface Notification {
  id: string;
  from: string;
  type: string;
  time: string;
  msg: string;
  priority: boolean;
  targetType: "division" | "batch" | "individual" | "branch" | "all";
  targetId: string;
  createdAt: number;
}

interface Booking {
  id: string;
  roomId: string;
  roomNumber: string;
  facultyName: string;
  facultyAbbr: string;
  subject: string;
  timeSlot: string;
  date: string;
  targetType: "division" | "batch" | "all";
  targetId: string;
  type: string;
}

interface GovernanceContextType {
  faculty: Faculty[];
  students: Partial<UserProfile>[];
  subjects: string[];
  notifications: Notification[];
  bookings: Booking[];
  addFaculty: (f: Faculty) => void;
  updateFaculty: (oldAbbr: string, f: Faculty) => void;
  deleteFaculty: (abbr: string) => void;
  addStudent: (s: Partial<UserProfile>) => void;
  updateStudent: (rollNumber: string, s: Partial<UserProfile>) => void;
  deleteStudent: (rollNumber: string) => void;
  addSubject: (s: string) => void;
  updateSubject: (oldS: string, newS: string) => void;
  deleteSubject: (s: string) => void;
  addNotification: (n: Omit<Notification, "id" | "time">) => void;
  deleteNotification: (id: string) => void;
  addBooking: (b: Omit<Booking, "id">) => void;
  deleteBooking: (id: string) => void;
}

const GovernanceContext = createContext<GovernanceContextType | undefined>(undefined);

export function GovernanceProvider({ children }: { children: React.ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem("governance_faculty");
    return saved ? JSON.parse(saved) : INITIAL_FACULTY;
  });

  const [students, setStudents] = useState<Partial<UserProfile>[]>(() => {
    const saved = localStorage.getItem("governance_students");
    return saved ? JSON.parse(saved) : SEED_STUDENTS;
  });

  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("governance_subjects");
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Periodically fetch notifications from the server
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Sync every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("governance_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("governance_faculty", JSON.stringify(faculty));
    
    // Auto-refresh faculty list if new faculty added to constants or name changed
    const needsRefresh = INITIAL_FACULTY.some(inf => 
      !faculty.find(f => f.abbr === inf.abbr) || 
      faculty.find(f => f.abbr === inf.abbr)?.name !== inf.name
    );
    
    if (needsRefresh) {
      setFaculty(prev => {
        const updated = [...prev];
        INITIAL_FACULTY.forEach(inf => {
          const index = updated.findIndex(f => f.abbr === inf.abbr);
          if (index === -1) {
            updated.push(inf);
          } else if (updated[index].name !== inf.name) {
            updated[index].name = inf.name;
          }
        });
        return updated;
      });
    }
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem("governance_students", JSON.stringify(students));
    
    // Auto-migrate batches if they exist in state (A4->A3, B4->B3, C4->C3)
    const hasOldBatches = students.some(s => s.batch === "A4" || s.batch === "B4" || s.batch === "C4");
    if (hasOldBatches) {
      setStudents(prev => prev.map(s => {
        if (s.batch === "A4") return { ...s, batch: "A3" };
        if (s.batch === "B4") return { ...s, batch: "B3" };
        if (s.batch === "C4") return { ...s, batch: "C3" };
        return s;
      }));
    }
  }, [students]);

  useEffect(() => {
    localStorage.setItem("governance_subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("governance_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("governance_bookings", JSON.stringify(bookings));
  }, [bookings]);

  const addFaculty = (f: Faculty) => setFaculty(prev => [...prev, f]);
  const updateFaculty = (oldAbbr: string, f: Faculty) => {
    setFaculty(prev => prev.map(item => item.abbr === oldAbbr ? f : item));
  };
  const deleteFaculty = (abbr: string) => {
    setFaculty(prev => prev.filter(item => item.abbr !== abbr));
  };

  const addStudent = (s: Partial<UserProfile>) => setStudents(prev => [...prev, s]);
  const updateStudent = (rollNumber: string, s: Partial<UserProfile>) => {
    setStudents(prev => prev.map(item => item.rollNumber === rollNumber ? s : item));
  };
  const deleteStudent = (rollNumber: string) => {
    setStudents(prev => prev.filter(item => item.rollNumber !== rollNumber));
  };

  const addSubject = (s: string) => setSubjects(prev => [...prev, s]);
  const updateSubject = (oldS: string, newS: string) => {
    setSubjects(prev => prev.map(item => item === oldS ? newS : item));
  };
  const deleteSubject = (s: string) => {
    setSubjects(prev => prev.filter(item => item !== s));
  };

  const addNotification = async (n: Omit<Notification, "id" | "time" | "createdAt">) => {
    const now = new Date();
    const newNotif: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.getTime()
    };
    
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotif)
      });
      setNotifications(prev => [newNotif, ...prev]);
    } catch (err) {
      console.error("Failed to add notification", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const addBooking = (b: Omit<Booking, "id">) => {
    const newBooking: Booking = {
      ...b,
      id: Math.random().toString(36).substr(2, 9)
    };
    setBookings(prev => [...prev, newBooking]);
  };

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <GovernanceContext.Provider value={{
      faculty,
      students,
      subjects,
      notifications,
      bookings,
      addFaculty,
      updateFaculty,
      deleteFaculty,
      addStudent,
      updateStudent,
      deleteStudent,
      addSubject,
      updateSubject,
      deleteSubject,
      addNotification,
      deleteNotification,
      addBooking,
      deleteBooking
    }}>
      {children}
    </GovernanceContext.Provider>
  );
}

export function useGovernance() {
  const context = useContext(GovernanceContext);
  if (context === undefined) {
    throw new Error("useGovernance must be used within a GovernanceProvider");
  }
  return context;
}
