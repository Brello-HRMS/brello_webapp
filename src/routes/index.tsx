import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import { MainLayout } from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import { AuthLayout } from '../features/auth/components/AuthLayout/AuthLayout';
import { Login } from '../features/auth/components/Login/Login';
// import { LeadForm } from '../features/auth/components/Lead/leadForm';
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
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
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
