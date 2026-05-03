export type UserRole = "admin" | "teacher" | "student";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  division?: string; // For students
  batch?: string; // For students
  rollNumber?: string; // For students
  branch?: string; // For students
  facultyAbbreviation?: string; // For teachers
}

export interface Classroom {
  id: string;
  roomNumber: string;
  name?: string;
  floor: number;
  building: string;
  capacity: number;
  type: "lecture_hall" | "lab";
  benchStructure: {
    rows: number;
    cols: number;
    seatsPerBench: number;
  };
}

export interface Booking {
  id: string;
  roomId: string;
  roomNumber: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  startTime: string; // ISO
  endTime: string; // ISO
  type: "lecture" | "lab" | "event" | "exam";
  batch?: string;
  division?: string;
}

export interface Notification {
  id: string;
  senderId: string;
  senderName: string;
  title: string;
  message: string;
  timestamp: string;
  recipients: {
    type: "individual" | "division" | "batch" | "all";
    targetId: string; // userId, division name, or batch name
  };
}

export interface ExamSession {
  id: string;
  title: string;
  date: string;
  subjects: string[];
  divisions: string[];
  totalStudents: number;
}

export interface SeatingArrangement {
  id: string;
  sessionId: string;
  studentId: string;
  studentRoll: string;
  studentName: string;
  division: string;
  branch: string;
  roomNumber: string;
  benchNumber: number;
  seatNumber: number;
}
