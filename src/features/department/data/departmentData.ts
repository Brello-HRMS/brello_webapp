export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  designation: string;
  type: 'Office' | 'Remote';
  status: 'Permanent' | 'Temporary';
  avatar: string;
}

export const departmentList: Employee[] = [
  {
    id: 'D001',
    name: 'Design Department',
    email: 'design@brello.ai',
    phone: '+1 234 567 890',
    location: 'New York, USA',
    designation: 'Department Head: John Doe',
    type: 'Office',
    status: 'Permanent',
    avatar: 'https://i.pravatar.cc/150?u=design',
  },
  {
    id: '345321456',
    name: 'John Doe',
    email: 'john.doe@brello.ai',
    phone: '+1 234 567 891',
    location: 'New York, USA',
    designation: 'Lead UX Designer',
    type: 'Office',
    status: 'Permanent',
    avatar: 'https://i.pravatar.cc/150?u=john',
  },
  ...Array.from({ length: 30 }).map((_, i) => ({
    id: `E00${i + 3}`,
    name: `Employee ${i + 3}`,
    email: `employee${i + 3}@brello.ai`,
    phone: `+1 234 567 ${900 + i}`,
    location: i % 2 === 0 ? 'London, UK' : 'Austin, USA',
    designation: i % 3 === 0 ? 'Backend Developer' : 'Frontend Engineer',
    type: (i % 4 === 0 ? 'Remote' : 'Office') as 'Office' | 'Remote',
    status: 'Permanent' as 'Permanent' | 'Temporary',
    avatar: `https://i.pravatar.cc/150?u=${i + 3}`,
  })),
];
