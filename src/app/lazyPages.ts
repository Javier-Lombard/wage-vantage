import { lazy } from 'react';

export const About = lazy(() =>
  import('@/pages/About').then((module) => ({ default: module.About })),
);
export const ComparisonPage = lazy(() =>
  import('@/pages/ComparisonPage').then((module) => ({ default: module.ComparisonPage })),
);
export const DashboardHome = lazy(() =>
  import('@/pages/DashboardHome').then((module) => ({ default: module.DashboardHome })),
);
export const Home = lazy(() => import('@/pages/Home').then((module) => ({ default: module.Home })));
export const ManagePlan = lazy(() =>
  import('@/pages/ManagePlan').then((module) => ({ default: module.ManagePlan })),
);
export const MyTemplates = lazy(() =>
  import('@/pages/MyTemplates').then((module) => ({ default: module.MyTemplates })),
);
export const Plans = lazy(() =>
  import('@/pages/Plans').then((module) => ({ default: module.Plans })),
);
export const Privacy = lazy(() =>
  import('@/pages/Privacy').then((module) => ({ default: module.Privacy })),
);
export const SavedComparisons = lazy(() =>
  import('@/pages/SavedComparisons').then((module) => ({ default: module.SavedComparisons })),
);
export const UserSettings = lazy(() =>
  import('@/pages/UserSettings').then((module) => ({ default: module.UserSettings })),
);
