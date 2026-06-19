import { redirect } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { getCookie } from '../utils/cookieUtils';
import { isAdminApp } from '../utils/authUtils';
import { RequireAccess } from '../components/common';
import { ModuleCode } from '../enum/modules';
import HomePage from '../pages/HomePage';
import DailyPreviewPage from '../pages/attendance/DailyPreviewPage';
import DepartmentPage from '../pages/department/DepartmentPage';
import DepartmentDetailPage from '../pages/department/DepartmentDetailPage';
import ClientPage from '../pages/client/ClientPage';
import ClientDetailPage from '../pages/client/ClientDetailPage';
import DesignationPage from '../pages/designation/DesignationPage';
import DesignationDetailPage from '../pages/designation/DesignationDetailPage';
import ProjectPage from '../pages/project/ProjectPage';
import ProjectDetailPage from '../pages/project/ProjectDetailPage';
import PoliciesPage from '../pages/policies/PoliciesPage';
import HolidaysPage from '../pages/holidays/HolidaysPage';
import HolidayCalendarView from '../pages/holidays/HolidayCalendarView';
import EmployeeDirectoryPage from '../pages/Employee/Directory/EmployeeDirectoryPage';
import EmployeeProfileAdminPage from '../pages/Employee/Profile/EmployeeProfilePage';
import PayrollConfigPage from '../pages/payroll/PayrollConfigPage';
import PayrollEmployeesPage from '../pages/payroll/PayrollEmployeesPage';
import PayrollEmployeeDetailPage from '../pages/payroll/PayrollEmployeeDetailPage';
import RolesPage from '../pages/access/RolesPage';
import UsersPage from '../pages/access/UsersPage';
import PermissionsPage from '../pages/access/PermissionsPage';
import ReimbursementPage from '../pages/reimbursement/ReimbursementPage';
import LeaveConfigPage from '../pages/leave/LeaveConfigPage';
import AnnouncementPage from '../pages/announcement/AnnouncementPage';
import AttendanceSetupPage from '../pages/attendance/setup/AttendanceSetupPage';
import LeaveManagementPage from '../pages/attendance/LeaveManagementPage';
import LeaveRequestsPage from '../pages/attendance/LeaveRequestsPage';
import BillingPlanPage from '../pages/billing/BillingPlanPage';
import BillingInvoicePage from '../pages/billing/BillingInvoicePage';
import BillingPaymentHistoryPage from '../pages/billing/BillingPaymentHistoryPage';
import OrgLetterTemplatesPage from '../pages/letters/OrgLetterTemplatesPage';

export const adminRoutes: RouteObject[] = [
  { path: '/dashboard', element: <HomePage /> },

  // ── Organisation ─────────────────────────────────────────────────────────
  {
    path: 'organisation/departments',
    element: (
      <RequireAccess module={ModuleCode.ORG_DEPARTMENTS}>
        <DepartmentPage />
      </RequireAccess>
    ),
  },
  {
    path: 'organisation/departments/:id',
    element: (
      <RequireAccess module={ModuleCode.ORG_DEPARTMENTS}>
        <DepartmentDetailPage />
      </RequireAccess>
    ),
  },
  {
    path: 'organisation/designations',
    element: (
      <RequireAccess module={ModuleCode.ORG_DESIGNATIONS}>
        <DesignationPage />
      </RequireAccess>
    ),
  },
  {
    path: 'organisation/designations/:id',
    element: (
      <RequireAccess module={ModuleCode.ORG_DESIGNATIONS}>
        <DesignationDetailPage />
      </RequireAccess>
    ),
  },
  {
    path: 'organisation/policies',
    element: (
      <RequireAccess module={ModuleCode.ORG_POLICIES}>
        <PoliciesPage />
      </RequireAccess>
    ),
  },
  {
    path: 'organisation/payroll',
    element: (
      <RequireAccess module={ModuleCode.ORG_PAYROLL}>
        <PayrollConfigPage />
      </RequireAccess>
    ),
  },
  {
    path: 'organisation/leave-config',
    element: (
      <RequireAccess module={ModuleCode.LEAVE_SETUP}>
        <LeaveConfigPage />
      </RequireAccess>
    ),
  },

  // ── Employee ──────────────────────────────────────────────────────────────
  {
    path: 'employee/directory',
    element: (
      <RequireAccess module={ModuleCode.EMP_DIRECTORY}>
        <EmployeeDirectoryPage />
      </RequireAccess>
    ),
  },
  {
    path: 'employee/profile/:id',
    element: (
      <RequireAccess module={ModuleCode.EMP_PROFILE_ADMIN}>
        <EmployeeProfileAdminPage />
      </RequireAccess>
    ),
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  {
    path: 'attendance/balance',
    element: (
      <RequireAccess module={ModuleCode.LEAVE_BALANCE}>
        <LeaveManagementPage />
      </RequireAccess>
    ),
  },
  {
    path: 'attendance/requests',
    element: (
      <RequireAccess module={ModuleCode.LEAVE_REQUESTS}>
        <LeaveRequestsPage />
      </RequireAccess>
    ),
  },
  {
    path: 'attendance/daily',
    element: (
      <RequireAccess module={ModuleCode.ATTENDANCE_DAILY}>
        <DailyPreviewPage />
      </RequireAccess>
    ),
  },
  {
    path: 'attendance/holidays',
    element: (
      <RequireAccess module={ModuleCode.LEAVE_HOLIDAYS}>
        <HolidaysPage />
      </RequireAccess>
    ),
  },
  {
    path: 'attendance/holidays/:id',
    element: (
      <RequireAccess module={ModuleCode.LEAVE_HOLIDAYS}>
        <HolidayCalendarView />
      </RequireAccess>
    ),
  },
  {
    path: 'attendance/setup',
    element: (
      <RequireAccess module={ModuleCode.ATTENDANCE_SETUP}>
        <AttendanceSetupPage />
      </RequireAccess>
    ),
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  {
    path: 'project/clients',
    element: (
      <RequireAccess module={ModuleCode.PROJECT_CLIENTS}>
        <ClientPage />
      </RequireAccess>
    ),
  },
  {
    path: 'project/clients/:id',
    element: (
      <RequireAccess module={ModuleCode.PROJECT_CLIENTS}>
        <ClientDetailPage />
      </RequireAccess>
    ),
  },
  {
    path: 'project/projects',
    element: (
      <RequireAccess module={ModuleCode.PROJECT_PROJECTS}>
        <ProjectPage />
      </RequireAccess>
    ),
  },
  {
    path: 'project/clients/:clientId/projects/:projectId',
    element: (
      <RequireAccess module={ModuleCode.PROJECT_PROJECTS}>
        <ProjectDetailPage />
      </RequireAccess>
    ),
  },

  // ── Payroll ───────────────────────────────────────────────────────────────
  {
    path: 'payroll/listing',
    element: (
      <RequireAccess module={ModuleCode.PAYROLL_OVERVIEW}>
        <PayrollEmployeesPage />
      </RequireAccess>
    ),
  },
  {
    path: 'payroll/listing/:employeeId',
    element: (
      <RequireAccess module={ModuleCode.PAYROLL_OVERVIEW}>
        <PayrollEmployeeDetailPage />
      </RequireAccess>
    ),
  },

  // ── Reimbursement ─────────────────────────────────────────────────────────
  {
    path: 'reimbursement',
    loader: () => {
      if (!getCookie('auth_response')) return redirect('/auth/login');
      return isAdminApp() ? redirect('/reimbursement/list') : redirect('/reimbursement/me');
    },
  },
  {
    path: 'reimbursement/list',
    element: (
      <RequireAccess module={ModuleCode.REIMBURSEMENT}>
        <ReimbursementPage />
      </RequireAccess>
    ),
  },

  // ── Announcements ─────────────────────────────────────────────────────────
  {
    path: 'announcements',
    loader: () => {
      if (!getCookie('auth_response')) return redirect('/auth/login');
      return isAdminApp() ? redirect('/announcements/list') : redirect('/announcements/me');
    },
  },
  {
    path: 'announcements/list',
    element: (
      <RequireAccess module={ModuleCode.ANNOUNCEMENT}>
        <AnnouncementPage />
      </RequireAccess>
    ),
  },

  // ── Access Control ────────────────────────────────────────────────────────
  {
    path: 'access/roles',
    element: (
      <RequireAccess module={ModuleCode.ACCESS_ROLES}>
        <RolesPage />
      </RequireAccess>
    ),
  },
  {
    path: 'access/users',
    element: (
      <RequireAccess module={ModuleCode.ACCESS_USERS}>
        <UsersPage />
      </RequireAccess>
    ),
  },
  {
    path: 'access/permissions',
    element: (
      <RequireAccess module={ModuleCode.ACCESS_PERMISSIONS}>
        <PermissionsPage />
      </RequireAccess>
    ),
  },

  // ── Organisation Letter Templates ───────────────────────────────────────
  {
    path: 'organisation/letter-templates',
    element: (
      <RequireAccess module={ModuleCode.OFFER_TEMPLATES}>
        <OrgLetterTemplatesPage />
      </RequireAccess>
    ),
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  { path: 'billing/plan', element: <BillingPlanPage /> },
  { path: 'billing/invoice', element: <BillingInvoicePage /> },
  { path: 'billing/payments', element: <BillingPaymentHistoryPage /> },
];
