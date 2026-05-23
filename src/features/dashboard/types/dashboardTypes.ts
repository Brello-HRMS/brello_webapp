export interface BirthdayEmployee {
  id: string;
  name: string;
  empId: string;
  avatar?: string;
  birthDay: number;
}

export interface NewHire {
  id: string;
  name: string;
  department: string;
  avatar?: string;
  joiningDate: string;
}

export interface Holiday {
  id: string;
  name: string;
  dayOfWeek: string;
  date: number;
}

export interface ApprovalItem {
  label: string;
  count: number;
  iconType: 'leave' | 'attendance';
  path: string;
}

export interface DashboardStats {
  totalEmployees: number;
  employeeTrend: string;
  attendancePercent: string;
  attendanceTrend: string;
  payrollAmount: string;
}

export interface DashboardData {
  stats: DashboardStats;
  approvalItems: ApprovalItem[];
  birthdays: BirthdayEmployee[];
  announcementCount: number;
  holidays: Holiday[];
  holidayCount: number;
  newHires: NewHire[];
  shiftTime: string;
  shiftDay: string;
}
