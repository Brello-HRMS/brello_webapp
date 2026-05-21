export type AttendanceStatus = 'Present' | 'Late' | 'Half-day' | 'Absent';

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employee: Employee;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  lateArrivals: number;
  halfDays: number;
  totalEntries: number;
}
