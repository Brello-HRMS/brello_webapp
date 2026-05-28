import { createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';

import { MainLayout } from '../components/layout/MainLayout';
import { RequireAccess } from '../components/common';
import { ModuleCode } from '../enum/modules';
import HomePage from '../pages/HomePage';
import { AuthLayout } from '../features/auth/components/AuthLayout/AuthLayout';
import { Login } from '../features/auth/components/Login/Login';
import { RegisterForm } from '../features/auth/components/Register/RegisterForm';
import { LeadForm } from '../features/auth/components/Lead/LeadForm';
import { WelcomeScreen } from '../features/auth/components/Welcome/WelcomeScreen';
import { OtpForm } from '../features/auth/components/OtpForm/OtpForm';
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
import EmployeeReimbursementPage from '../pages/reimbursement/EmployeeReimbursementPage';
import LeaveConfigPage from '../pages/leave/LeaveConfigPage';
import AnnouncementPage from '../pages/announcement/AnnouncementPage';
import EmployeeAnnouncementPage from '../pages/announcement/EmployeeAnnouncementPage';
import AttendanceSetupPage from '../pages/attendance/setup/AttendanceSetupPage';
import { AppId } from '../enum/app';
import LeaveManagementPage from '../pages/attendance/LeaveManagementPage';
import LeaveRequestsPage from '../pages/attendance/LeaveRequestsPage';
import PlatformDashboardPage from '../pages/platform/PlatformDashboardPage';
import PlatformIndustryTypePage from '../pages/platform/PlatformIndustryTypePage';
import PlatformDepartmentPage from '../pages/platform/PlatformDepartmentPage';
import PlatformDesignationPage from '../pages/platform/PlatformDesignationPage';

const isAuthenticated = () => {
  const authResponse = sessionStorage.getItem('auth_response');
  if (authResponse) {
    try {
      const parsed = JSON.parse(authResponse);
      return !!parsed?.data?.access_token;
    } catch {
      return false;
    }
  }
  return false;
};

const isPlatformAdmin = () => {
  const authResponse = sessionStorage.getItem('auth_response');
  if (authResponse) {
    try {
      const parsed = JSON.parse(authResponse);
      return !!parsed?.data?.user?.is_platform_admin;
    } catch {
      return false;
    }
  }
  return false;
};

const protectedLoader = () => {
  if (!isAuthenticated()) {
    return redirect('/auth/login');
  }
  return null;
};

const platformAdminLoader = () => {
  if (!isAuthenticated()) return redirect('/auth/login');
  if (!isPlatformAdmin()) return redirect('/dashboard');
  return null;
};

const publicLoader = () => {
  if (isAuthenticated()) {
    return redirect('/');
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    loader: publicLoader,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <RegisterForm /> },
      { path: 'otp', element: <OtpForm /> },
      { path: 'lead', element: <LeadForm /> },
      { path: '', element: <Navigate to="login" replace /> },
    ],
  },
  {
    path: '/auth/welcome',
    element: <WelcomeScreen />,
  },
  {
    path: '/platform',
    element: <MainLayout />,
    loader: platformAdminLoader,
    children: [
      { path: 'dashboard', element: <PlatformDashboardPage /> },
      { path: 'setup/industry-types', element: <PlatformIndustryTypePage /> },
      { path: 'setup/departments', element: <PlatformDepartmentPage /> },
      { path: 'setup/designations', element: <PlatformDesignationPage /> },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    loader: protectedLoader,
    children: [
      {
        path: '/dashboard',
        element: <HomePage />,
      },

      // ── Organisation ───────────────────────────────────────────────────────
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
        path: 'project/clients',
        element: <ClientPage />,
      },
      {
        path: 'project/clients/:id',
        element: <ClientDetailPage />,
      },
      {
        path: 'attendance/holidays',
        element: <HolidaysPage />,
      },
      {
        path: 'attendance/holidays/:id',
        element: <HolidayCalendarView />,
      },
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
        path: 'project/projects',
        element: <ProjectPage />,
      },
      {
        path: 'project/clients/:clientId/projects/:projectId',
        element: <ProjectDetailPage />,
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

      // ── Employee ───────────────────────────────────────────────────────────
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

      // ── Attendance ─────────────────────────────────────────────────────────
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

      // ── Projects ───────────────────────────────────────────────────────────
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

      // ── Payroll ────────────────────────────────────────────────────────────
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

      // ── Reimbursement ──────────────────────────────────────────────────────
      {
        path: 'reimbursement',
        loader: () => {
          const authResponseStr = sessionStorage.getItem('auth_response');
          if (authResponseStr) {
            try {
              const authResponse = JSON.parse(authResponseStr);
              const appId = authResponse?.data?.defaultAppId;
              if (appId === AppId.ADMIN) return redirect('/reimbursement/list');
              return redirect('/reimbursement/me');
            } catch {
              return redirect('/auth/login');
            }
          }
          return redirect('/auth/login');
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
      {
        path: 'reimbursement/me',
        element: <EmployeeReimbursementPage />,
      },

      // ── Announcements ──────────────────────────────────────────────────────
      {
        path: 'announcements',
        loader: () => {
          const authResponseStr = sessionStorage.getItem('auth_response');
          if (authResponseStr) {
            try {
              const authResponse = JSON.parse(authResponseStr);
              const appId = authResponse?.data?.defaultAppId;
              if (appId === AppId.ADMIN) return redirect('/announcements/list');
              return redirect('/announcements/me');
            } catch {
              return redirect('/auth/login');
            }
          }
          return redirect('/auth/login');
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
      {
        path: 'announcements/me',
        element: <EmployeeAnnouncementPage />,
      },

      // ── Access Control ─────────────────────────────────────────────────────
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

      { path: '*', element: <div>404 Not Found</div> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
