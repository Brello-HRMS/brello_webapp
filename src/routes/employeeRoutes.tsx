import type { RouteObject } from 'react-router-dom';

import EmployeeReimbursementPage from '../pages/reimbursement/EmployeeReimbursementPage';
import EmployeeAnnouncementPage from '../pages/announcement/EmployeeAnnouncementPage';

export const employeeRoutes: RouteObject[] = [
  { path: 'reimbursement/me', element: <EmployeeReimbursementPage /> },
  { path: 'announcements/me', element: <EmployeeAnnouncementPage /> },
];
