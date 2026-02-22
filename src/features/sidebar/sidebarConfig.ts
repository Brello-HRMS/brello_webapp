import {
  LayoutDashboard,
  Globe,
  Users,
  CalendarCheck,
  KeyRound,
  type LucideIcon,
  Mails,
  HandCoins,
  ScrollText,
  Tags,
} from 'lucide-react';

export type SubMenuItem = {
  label: string;
  path: string;
};

export type MenuItem = {
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: SubMenuItem[];
};

export const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    children: [
      { label: 'Daily Preview', path: '/dashboard/daily' },
      { label: 'Analytics', path: '/dashboard/analytics' },
    ],
  },
  {
    label: 'Organisation',
    icon: Globe,
    children: [
      { label: 'Departments', path: '/organisation/departments' },
      { label: 'Designations', path: '/organisation/designations' },
      { label: 'Policies', path: '/organisation/policies' },
      { label: 'Payroll', path: '/organisation/payroll' },
    ],
  },
  {
    label: 'Employee',
    icon: Users,
    children: [
      { label: 'Profile', path: '/employee/profile' },
      { label: 'Directory', path: '/employee/directory' },
    ],
  },
  {
    label: 'Attendance',
    icon: CalendarCheck,
    children: [
      { label: 'Daily Preview', path: '/attendance/daily' },
      { label: 'Reports', path: '/attendance/reports' },
    ],
  },
  {
    label: 'Leave',
    icon: Mails,
    children: [
      { label: 'Holidays', path: '/leave/holidays' },
      { label: 'Setup', path: '/leave/setup' },
    ],
  },
  {
    label: 'Payroll',
    icon: HandCoins,
    children: [
      { label: 'Overview', path: '/payroll/overview' },
      { label: 'Settings', path: '/payroll/settings' },
    ],
  },
  {
    label: 'Offer Letter',
    icon: ScrollText,
    children: [
      { label: 'Templates', path: '/offer-letter/templates' },
      { label: 'Drafts', path: '/offer-letter/drafts' },
    ],
  },
  {
    label: 'Access',
    icon: KeyRound,
    children: [
      { label: 'Roles', path: '/access/roles' },
      { label: 'Permissions', path: '/access/permissions' },
    ],
  },
  {
    label: 'Billing',
    icon: Tags,
    path: '/billing',
  },
];
