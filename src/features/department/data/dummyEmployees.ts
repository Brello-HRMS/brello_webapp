import { Status } from '../../../types/common';

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  avatar: string;
  designation: string;
  type: 'Office' | 'Remote';
  status: 'Permanent' | 'Temporary';
  employmentStatus: Status;
}

export const DUMMY_EMPLOYEES: Employee[] = [
  {
    id: '1',
    employeeId: '345321456',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?u=john',
    designation: 'Lead UX Designer',
    type: 'Office',
    status: 'Permanent',
    employmentStatus: Status.ACTIVE,
  },
  {
    id: '2',
    employeeId: '321434556',
    name: 'James Smith',
    avatar: 'https://i.pravatar.cc/150?u=james',
    designation: 'Lead UI/UX Designer',
    type: 'Office',
    status: 'Permanent',
    employmentStatus: Status.ACTIVE,
  },
  {
    id: '3',
    employeeId: '332144556',
    name: 'Alice Alexander',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    designation: 'UI Strategist',
    type: 'Remote',
    status: 'Permanent',
    employmentStatus: Status.ACTIVE,
  },
  {
    id: '4',
    employeeId: '345645321',
    name: 'Robert Downey',
    avatar: 'https://i.pravatar.cc/150?u=robert',
    designation: 'Sr. UI/UX Designer',
    type: 'Remote',
    status: 'Permanent',
    employmentStatus: Status.ACTIVE,
  },
  {
    id: '5',
    employeeId: '321434556',
    name: 'Mariya Philip',
    avatar: 'https://i.pravatar.cc/150?u=mariya',
    designation: 'UI Designer',
    type: 'Office',
    status: 'Permanent',
    employmentStatus: Status.ACTIVE,
  },
  {
    id: '6',
    employeeId: '453321456',
    name: 'Chris Don',
    avatar: 'https://i.pravatar.cc/150?u=chris',
    designation: 'UI/UX Designer',
    type: 'Office',
    status: 'Permanent',
    employmentStatus: Status.ACTIVE,
  },
  {
    id: '7',
    employeeId: '456345321',
    name: 'Robin Mathew',
    avatar: 'https://i.pravatar.cc/150?u=robin',
    designation: 'Design Engineer',
    type: 'Remote',
    status: 'Temporary',
    employmentStatus: Status.INACTIVE,
  },
];
