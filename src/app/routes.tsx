import { createBrowserRouter } from 'react-router';

import { RootLayout } from '@/app/RootLayout';
import { About } from '@/pages/About';
import { ComparisonPage } from '@/pages/ComparisonPage';
import { DashboardHome } from '@/pages/DashboardHome';
import { Home } from '@/pages/Home';
import { ManagePlan } from '@/pages/ManagePlan';
import { MyTemplates } from '@/pages/MyTemplates';
import { Plans } from '@/pages/Plans';
import { SavedComparisons } from '@/pages/SavedComparisons';
import { UserDashboardLayout } from '@/pages/UserDashboardLayout';
import { UserSettings } from '@/pages/UserSettings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'plans', element: <Plans /> },
      { path: 'comparison', element: <ComparisonPage /> },
      {
        path: 'dashboard',
        element: <UserDashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          {
            path: 'settings',
            children: [
              { index: true, element: <UserSettings /> },
              { path: 'manage-plan', element: <ManagePlan /> },
            ],
          },
          { path: 'templates', element: <MyTemplates /> },
          { path: 'comparisons', element: <SavedComparisons /> },
        ],
      },
    ],
  },
]);
