export interface EmployeeLeaveBalance {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department: string;
  policyType: string;
  totalBalance: number;
  maxBalance: number;
  lastAccrual: string;
  balances: {
    CL: number;
    SL: number;
    EL: number;
  };
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  role: string;
  department: string;
  leaveType: string;
  dateRange: string;
  fromDate: string;
  toDate: string;
  duration: string;
  totalDays: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
  balances: {
    CL: number;
    SL: number;
    EL: number;
  };
}

export const MOCK_EMPLOYEES: EmployeeLeaveBalance[] = [
  {
    id: 'EMP-001',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?u=EMP001',
    role: 'Senior Software Engineer',
    department: 'Design',
    policyType: '',
    totalBalance: 24.5,
    maxBalance: 30,
    lastAccrual: 'Mar 02, 2026',
    balances: { CL: 4, SL: 2, EL: 12 },
  },
  {
    id: 'EMP-042',
    name: 'James Smith',
    avatar: 'https://i.pravatar.cc/150?u=EMP042',
    role: 'Product Designer',
    department: 'Engineering',
    policyType: '',
    totalBalance: 2.0,
    maxBalance: 30,
    lastAccrual: 'Feb 27, 2026',
    balances: { CL: 2, SL: 5, EL: 10 },
  },
  {
    id: 'EMP-098',
    name: 'Alice Alexander',
    avatar: 'https://i.pravatar.cc/150?u=EMP098',
    role: 'HR Manager',
    department: 'Human Resource',
    policyType: '',
    totalBalance: 18.0,
    maxBalance: 30,
    lastAccrual: 'Mar 14, 2026',
    balances: { CL: 3, SL: 4, EL: 8 },
  },
  {
    id: 'EMP-112',
    name: 'Robert Downey',
    avatar: 'https://i.pravatar.cc/150?u=EMP112',
    role: 'Lead Developer',
    department: 'Product',
    policyType: '',
    totalBalance: 23.0,
    maxBalance: 30,
    lastAccrual: 'Jan 31, 2026',
    balances: { CL: 5, SL: 3, EL: 15 },
  },
  {
    id: 'EMP-001',
    name: 'Mariya Philip',
    avatar: 'https://i.pravatar.cc/150?u=EMP001-2',
    role: 'UI/UX Designer',
    department: 'Design',
    policyType: '',
    totalBalance: 2.5,
    maxBalance: 30,
    lastAccrual: 'Feb 11, 2026',
    balances: { CL: 4, SL: 6, EL: 12 },
  },
  {
    id: 'EMP-054',
    name: 'Chris Don',
    avatar: 'https://i.pravatar.cc/150?u=EMP054',
    role: 'Backend Engineer',
    department: 'Engineering',
    policyType: '',
    totalBalance: 17.5,
    maxBalance: 30,
    lastAccrual: 'Mar 24, 2026',
    balances: { CL: 6, SL: 2, EL: 14 },
  },
  {
    id: 'EMP-033',
    name: 'Robin Mathew',
    avatar: 'https://i.pravatar.cc/150?u=EMP033',
    role: 'QA Specialist',
    department: 'Engineering',
    policyType: '',
    totalBalance: 1,
    maxBalance: 30,
    lastAccrual: 'Feb 28, 2026',
    balances: { CL: 2, SL: 4, EL: 9 },
  },
];

export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR001',
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?u=EMP001',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    leaveType: 'Casual',
    dateRange: '12 Mar - 15 Mar',
    fromDate: '12 Mar, 2026',
    toDate: '15 Mar, 2026',
    duration: '4 Days',
    totalDays: 4,
    submittedTime: '2 hours ago',
    status: 'Pending',
    reason:
      "Attending my cousin's wedding ceremony in Bangalore. Need to travel on 12th morning. will be available on slack for emergencies.",
    balances: { CL: 4, SL: 2, EL: 12 },
  },
  {
    id: 'LR002',
    employeeId: 'EMP-042',
    employeeName: 'James Smith',
    avatar: 'https://i.pravatar.cc/150?u=EMP042',
    role: 'Product Designer',
    department: 'Engineering',
    leaveType: 'Sick',
    dateRange: '14 Mar',
    fromDate: '14 Mar, 2026',
    toDate: '14 Mar, 2026',
    duration: '1 Day',
    totalDays: 1,
    submittedTime: '3 hours ago',
    status: 'Pending',
    reason: 'Suffering from severe viral fever and doctor has advised bed rest.',
    balances: { CL: 2, SL: 5, EL: 10 },
  },
  {
    id: 'LR003',
    employeeId: 'EMP-098',
    employeeName: 'Alice Alexander',
    avatar: 'https://i.pravatar.cc/150?u=EMP098',
    role: 'HR Manager',
    department: 'Human Resource',
    leaveType: 'LOP',
    dateRange: '11 Mar - 13 Mar',
    fromDate: '11 Mar, 2026',
    toDate: '13 Mar, 2026',
    duration: '3 Days',
    totalDays: 3,
    submittedTime: '2 hours ago',
    status: 'Pending',
    reason: 'Personal work at hometown.',
    balances: { CL: 3, SL: 4, EL: 8 },
  },
  {
    id: 'LR004',
    employeeId: 'EMP-112',
    employeeName: 'Robert Downey',
    avatar: 'https://i.pravatar.cc/150?u=EMP112',
    role: 'Lead Developer',
    department: 'Product',
    leaveType: 'Sick',
    dateRange: '10 Mar - 11 Mar',
    fromDate: '10 Mar, 2026',
    toDate: '11 Mar, 2026',
    duration: '2 Days',
    totalDays: 2,
    submittedTime: '3 hours ago',
    status: 'Pending',
    reason: 'Medical checkup.',
    balances: { CL: 5, SL: 3, EL: 15 },
  },
  {
    id: 'LR005',
    employeeId: 'EMP-001',
    employeeName: 'Mariya Philip',
    avatar: 'https://i.pravatar.cc/150?u=EMP001-2',
    role: 'UI/UX Designer',
    department: 'Design',
    leaveType: 'Casual',
    dateRange: '12 Mar - 13 Mar',
    fromDate: '12 Mar, 2026',
    toDate: '13 Mar, 2026',
    duration: '2 Days',
    totalDays: 2,
    submittedTime: '2 hours ago',
    status: 'Pending',
    reason: 'Family emergency.',
    balances: { CL: 4, SL: 6, EL: 12 },
  },
  {
    id: 'LR006',
    employeeId: 'EMP-054',
    employeeName: 'Chris Don',
    avatar: 'https://i.pravatar.cc/150?u=EMP054',
    role: 'Backend Engineer',
    department: 'Engineering',
    leaveType: 'Casual',
    dateRange: '12 Mar - 13 Mar',
    fromDate: '12 Mar, 2026',
    toDate: '13 Mar, 2026',
    duration: '2 Days',
    totalDays: 2,
    submittedTime: '1 hour ago',
    status: 'Rejected',
    reason: 'Urgent task delivery.',
    balances: { CL: 6, SL: 2, EL: 14 },
  },
  {
    id: 'LR007',
    employeeId: 'EMP-033',
    employeeName: 'Robin Mathew',
    avatar: 'https://i.pravatar.cc/150?u=EMP033',
    role: 'QA Specialist',
    department: 'Engineering',
    leaveType: 'Casual',
    dateRange: '12 Mar - 13 Mar',
    fromDate: '12 Mar, 2026',
    toDate: '13 Mar, 2026',
    duration: '2 Days',
    totalDays: 2,
    submittedTime: '3 hours ago',
    status: 'Approved',
    reason: 'Personal work.',
    balances: { CL: 2, SL: 4, EL: 9 },
  },
];
