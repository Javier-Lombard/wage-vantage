import { Outlet } from 'react-router';

import { Navbar } from '@/app/layout/Navbar';
import { Footer } from '@/shared/components/layout/Footer';

export function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
