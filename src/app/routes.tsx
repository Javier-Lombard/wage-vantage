import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router';

import {
  About,
  ComparisonPage,
  DashboardHome,
  Home,
  ManagePlan,
  MyTemplates,
  Plans,
  Privacy,
  ResetPassword,
  SavedComparisons,
  UserSettings,
} from '@/app/lazyPages';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { RootLayout } from '@/app/RootLayout';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';
import { UserDashboardLayout } from '@/pages/UserDashboardLayout';
import { PageSkeleton } from '@/shared/components/ui';

import type { ReactNode } from 'react';

// Cada página vive en su propio chunk (ver lazyPages.ts); el layout que la
// envuelve (Root o UserDashboard) no es lazy, así que este fallback solo tapa
// el hueco de la página concreta y no la navegación/sidebar ya montada.
function withSuspense(page: ReactNode) {
  return <Suspense fallback={<PageSkeleton />}>{page}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // NotFound se importa de forma estática (no vía lazyPages): si el error viene
    // de un chunk lazy que falló al cargar, un errorElement también lazy podría
    // fallar por la misma razón y dejar al usuario sin nada que ver.
    errorElement: <NotFound />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      { path: 'about', element: withSuspense(<About />) },
      { path: 'privacy', element: withSuspense(<Privacy />) },
      { path: 'plans', element: withSuspense(<Plans />) },
      { path: 'comparison', element: withSuspense(<ComparisonPage />) },
      { path: 'reset-password', element: withSuspense(<ResetPassword />) },
      {
        path: 'dashboard',
        element: <ProtectedRoute />,
        errorElement: <ServerError />,
        children: [
          {
            element: <UserDashboardLayout />,
            children: [
              { index: true, element: withSuspense(<DashboardHome />) },
              {
                path: 'settings',
                children: [
                  { index: true, element: withSuspense(<UserSettings />) },
                  { path: 'manage-plan', element: withSuspense(<ManagePlan />) },
                ],
              },
              { path: 'templates', element: withSuspense(<MyTemplates />) },
              { path: 'comparisons', element: withSuspense(<SavedComparisons />) },
            ],
          },
        ],
      },
    ],
  },
]);
