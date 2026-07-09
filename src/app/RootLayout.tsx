import { Outlet } from 'react-router';

import { Navbar } from '@/app/layout/Navbar';
import { DemoTierSwitcher } from '@/features/premium';
import { Footer } from '@/shared/components/layout/Footer';

export function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      {import.meta.env.DEV && <DemoTierSwitcher />}
    </>
  );
}
