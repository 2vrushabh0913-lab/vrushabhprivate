export function parseTime(timeStr: string): { start: number; end: number } {
  // Expected format: "09:15 - 10:15"
  const parts = timeStr.split(" - ");
  if (parts.length !== 2) return { start: 0, end: 0 };

  const parseSingle = (t: string) => {
    // Format: "HH:MM" (assuming 24h for comparison but checking AM/PM if needed)
    // The schedule uses 09:15 - 10:15, 12:30 - 01:30 (this 01:30 is likely 13:30)
    let [hours, minutes] = t.split(":").map(Number);
    
    // Simple heuristic for 12h to 24h conversion based on the input range
    // 01, 02, 03, 04 are likely PM (after 12)
    if (hours >= 1 && hours <= 6) {
      hours += 12;
    }

    return hours * 60 + minutes;
  };

  return {
    start: parseSingle(parts[0]),
    end: parseSingle(parts[1])
  };
}

export function getCurrentMinutesFromMidnight(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getStatus(timeRange: string): "ongoing" | "upcoming" | "past" | "soon" {
  const { start, end } = parseTime(timeRange);
  const current = getCurrentMinutesFromMidnight();

  if (current >= start && current < end) return "ongoing";
  if (current < start) {
    if (start - current <= 60) return "soon";
    return "upcoming";
  }
  return "past";
}
