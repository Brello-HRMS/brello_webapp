import EmployeeReimbursementPage from '../pages/reimbursement/EmployeeReimbursementPage';
import EmployeeAnnouncementPage from '../pages/announcement/EmployeeAnnouncementPage';
import MyLettersPage from '../pages/employee-letters/MyLettersPage';
import EmployeeLeavePage from '../pages/leave/EmployeeLeavePage';
import MyTeamPage from '../pages/company-structure/MyTeamPage';
import { RequireAccess } from '../components/common';
import { ModuleCode } from '../enum/modules';

import type { RouteObject } from 'react-router-dom';

export const employeeRoutes: RouteObject[] = [
  { path: 'reimbursement/me', element: <EmployeeReimbursementPage /> },
  { path: 'announcements/me', element: <EmployeeAnnouncementPage /> },
  { path: 'letters/me', element: <MyLettersPage /> },
  { path: 'leave/me', element: <EmployeeLeavePage /> },
  {
    path: 'team',
    element: (
      <RequireAccess module={ModuleCode.EMP_COMPANY_STRUCTURE}>
        <MyTeamPage />
      </RequireAccess>
    ),
  },
];
