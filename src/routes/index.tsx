import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import { MainLayout } from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import DepartmentPage from '../pages/DepartmentPage';
import { AuthLayout } from '../features/auth/components/AuthLayout/AuthLayout';
import { Login } from '../features/auth/components/Login/Login';
// import { LeadForm } from '../features/auth/components/Lead/leadForm';
import { RegisterForm } from '../features/auth/components/Register/RegisterForm';
// import { LoginForm } from '../features/auth/components/LoginForm/LoginForm';
import { LeadForm } from '../features/auth/components/Lead/LeadForm';
import { WelcomeScreen } from '../features/auth/components/Welcome/WelcomeScreen';
import { OtpForm } from '../features/auth/components/OtpForm/OtpForm';
// import { Leadtest } from '../features/auth/components/leadtest/Leadtest';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
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
        path: '*',
        element: <div>404 Not Found</div>,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
