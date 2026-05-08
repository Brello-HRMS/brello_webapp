import { createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';

import { MainLayout } from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import { AuthLayout } from '../features/auth/components/AuthLayout/AuthLayout';
import { Login } from '../features/auth/components/Login/Login';
import { RegisterForm } from '../features/auth/components/Register/RegisterForm';
import { LeadForm } from '../features/auth/components/Lead/LeadForm';
import { WelcomeScreen } from '../features/auth/components/Welcome/WelcomeScreen';
import { OtpForm } from '../features/auth/components/OtpForm/OtpForm';
import EmployeeProfilePage from '../pages/Employee/Profile/EmployeeProfilePage';
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
import PayrollConfigPage from '../pages/payroll/PayrollConfigPage';
import PayrollEmployeesPage from '../pages/payroll/PayrollEmployeesPage';
import PayrollEmployeeDetailPage from '../pages/payroll/PayrollEmployeeDetailPage';
import RolesPage from '../pages/access/RolesPage';
import UsersPage from '../pages/access/UsersPage';
import ReimbursementPage from '../pages/reimbursement/ReimbursementPage';
import EmployeeReimbursementPage from '../pages/reimbursement/EmployeeReimbursementPage';
import LeaveConfigPage from '../pages/leave/LeaveConfigPage';
import AnnouncementPage from '../pages/announcement/AnnouncementPage';
import EmployeeAnnouncementPage from '../pages/announcement/EmployeeAnnouncementPage';
import { AppId } from '../enum/app';

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

const protectedLoader = () => {
  if (!isAuthenticated()) {
    return redirect('/auth/login');
  }
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
      {
        path: 'login',
        element: <Login />,
      },
      // {
      //   path: 'lead',
      //   element: <LeadForm />,
      // },
      {
        path: 'register',
        element: <RegisterForm />,
      },
      // {
      //   path: 'login',
      //   element: <LoginForm />,
      // },
      {
        path: 'otp',
        element: <OtpForm />,
      },
      {
        path: 'lead',
        element: <LeadForm />,
      },
      // {
      //   path: 'test',
      //   element: <Leadtest />,
      // },
      {
        path: '',
        element: <Navigate to="login" replace />,
      },
    ],
  },
  {
    path: '/auth/welcome',
    element: <WelcomeScreen />,
  },

  {
    path: '/',
    element: <MainLayout />,
    loader: protectedLoader,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'organisation/departments',
        element: <DepartmentPage />,
      },
      {
        path: 'organisation/policies',
        element: <PoliciesPage />,
      },
      {
        path: 'organisation/departments/:id',
        element: <DepartmentDetailPage />,
      },
      {
        path: 'organisation/designations',
        element: <DesignationPage />,
      },
      {
        path: 'organisation/designations/:id',
        element: <DesignationDetailPage />,
      },
      {
        path: 'employee/profile/:id',
        element: <EmployeeProfilePage />,
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
        path: 'project/projects',
        element: <ProjectPage />,
      },
      {
        path: 'project/clients/:clientId/projects/:projectId',
        element: <ProjectDetailPage />,
      },
      {
        path: 'employee/directory',
        element: <EmployeeDirectoryPage />,
      },
      {
        path: 'organisation/payroll',
        element: <PayrollConfigPage />,
      },
      {
        path: 'payroll/listing',
        element: <PayrollEmployeesPage />,
      },
      {
        path: 'payroll/listing/:employeeId',
        element: <PayrollEmployeeDetailPage />,
      },
      {
        path: 'reimbursement',
        loader: () => {
          const authResponseStr = sessionStorage.getItem('auth_response');
          if (authResponseStr) {
            try {
              const authResponse = JSON.parse(authResponseStr);
              const appId = authResponse?.data?.defaultAppId;
              // Admin App ID
              if (appId === AppId.ADMIN) {
                return redirect('/reimbursement/list');
              }
              // Default to employee view
              return redirect('/reimbursement/me');
            } catch {
              return redirect('/auth/login');
            }
          }
          return redirect('/auth/login');
        },
      },
      {
        path: 'access/roles',
        element: <RolesPage />,
      },
      {
        path: 'access/users',
        element: <UsersPage />,
      },
      {
        path: 'reimbursement/list',
        element: <ReimbursementPage />,
      },
      {
        path: 'reimbursement/me',
        element: <EmployeeReimbursementPage />,
      },
      {
        path: 'organisation/leave-config',
        element: <LeaveConfigPage />,
      },
      {
        path: 'announcements',
        loader: () => {
          const authResponseStr = sessionStorage.getItem('auth_response');
          if (authResponseStr) {
            try {
              const authResponse = JSON.parse(authResponseStr);
              const appId = authResponse?.data?.defaultAppId;
              if (appId === AppId.ADMIN) {
                return redirect('/announcements/list');
              }
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
        element: <AnnouncementPage />,
      },
      {
        path: 'announcements/me',
        element: <EmployeeAnnouncementPage />,
      },
      {
        path: '*',

        element: <div>404 Not Found</div>,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
