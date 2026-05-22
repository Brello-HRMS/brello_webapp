import { useMemo } from 'react';

import type { DashboardData } from '../types/dashboardTypes';

export const useDashboard = (): DashboardData => {
  return useMemo(
    () => ({
      stats: {
        totalEmployees: 104,
        employeeTrend: '+2%',
        attendancePercent: '92.5%',
        attendanceTrend: '+1.2%',
        payrollAmount: '₹9,99,999',
      },
      approvalItems: [
        { label: 'Leave Request', count: 3, iconType: 'leave', path: '/leave' },
        {
          label: 'Attendance Regularization',
          count: 2,
          iconType: 'attendance',
          path: '/attendance/setup',
        },
      ],
      birthdays: [
        { id: '1', name: 'John Doe', empId: 'EMP-001', birthDay: 13 },
        { id: '2', name: 'James Smith', empId: 'EMP-042', birthDay: 15 },
      ],
      announcementCount: 0,
      holidays: [
        { id: '1', name: 'Maha Shivaratri', dayOfWeek: 'Tuesday', date: 8 },
        { id: '2', name: 'Shaheed Diwas', dayOfWeek: 'Monday', date: 23 },
        { id: '3', name: 'Holi', dayOfWeek: 'Wednesday', date: 25 },
      ],
      holidayCount: 3,
      newHires: [
        { id: '1', name: 'John Doe', department: 'Product & Design', joiningDate: 'Mar 12' },
        { id: '2', name: 'James Smith', department: 'Engineering', joiningDate: 'Mar 12' },
        { id: '3', name: 'Alice Alexander', department: 'Human Resource', joiningDate: 'Mar 12' },
      ],
      shiftTime: '9:30 - 5:30 PM',
      shiftDay: 'Monday',
    }),
    [],
  );
};
