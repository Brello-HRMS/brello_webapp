import { createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';

import { getCookie } from '../utils/cookieUtils';
import { MainLayout } from '../components/layout/MainLayout';
import { AuthLayout } from '../features/auth/components/AuthLayout/AuthLayout';
import { Login } from '../features/auth/components/Login/Login';
import { RegisterForm } from '../features/auth/components/Register/RegisterForm';
import { LeadForm } from '../features/auth/components/Lead/LeadForm';
import { WelcomeScreen } from '../features/auth/components/Welcome/WelcomeScreen';
import { OtpForm } from '../features/auth/components/OtpForm/OtpForm';

import { adminRoutes } from './adminRoutes';
import { employeeRoutes } from './employeeRoutes';
import { platformAdminRoutes } from './platformAdminRoutes';

const isAuthenticated = () => {
  const authResponse = getCookie('auth_response');
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
  const authResponse = getCookie('auth_response');
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
    children: platformAdminRoutes,
  },
  {
    path: '/',
    element: <MainLayout />,
    loader: protectedLoader,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      ...adminRoutes,
      ...employeeRoutes,
      { path: '*', element: <div>404 Not Found</div> },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
