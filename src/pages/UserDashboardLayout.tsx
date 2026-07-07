import { Outlet } from 'react-router';

export function UserDashboardLayout() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:px-16">
      <Outlet />
    </main>
  );
}
