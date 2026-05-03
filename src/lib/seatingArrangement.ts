import { Classroom, SeatingArrangement, UserProfile } from "../types";

export function generateSeating(
  students: UserProfile[],
  classrooms: Classroom[],
  sessionId: string
): SeatingArrangement[] {
  // Sort students: First by Division, then by Roll Number
  const sortedStudents = [...students].sort((a, b) => {
    // Division comparison (A, B, C...)
    const divA = a.division || "";
    const divB = b.division || "";
    if (divA !== divB) {
      return divA.localeCompare(divB);
    }
    // Roll number comparison
    // Handle cases where rollNumber might be like "1101" or include letters
    const rollA = a.rollNumber || "";
    const rollB = b.rollNumber || "";
    
    // Check if they are numeric strings
    const numA = parseInt(rollA.replace(/\D/g, ''));
    const numB = parseInt(rollB.replace(/\D/g, ''));
    
    if (!isNaN(numA) && !isNaN(numB)) {
      if (numA !== numB) return numA - numB;
    }
    
    return rollA.localeCompare(rollB);
  });

  const arrangement: SeatingArrangement[] = [];
  let studentIndex = 0;

  for (const room of classrooms) {
    if (studentIndex >= sortedStudents.length) break;

    const totalSeats = room.capacity;
    // Always use 1 seat per bench for exams as requested
    const seatsPerBench = 1;
    
    for (let s = 0; s < totalSeats && studentIndex < sortedStudents.length; s++) {
      const student = sortedStudents[studentIndex];
      const benchNumber = s + 1; // Since seatsPerBench is 1, bench number is just s+1
      const seatNumber = 1;

      arrangement.push({
        id: crypto.randomUUID(),
        sessionId,
        studentId: student.uid,
        studentRoll: student.rollNumber || "N/A",
        studentName: student.displayName,
        division: student.division || "N/A",
        branch: student.branch || "N/A",
        roomNumber: room.roomNumber,
        benchNumber,
        seatNumber,
      });

      studentIndex++;
    }
  }

  return arrangement;
}
