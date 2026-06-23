import { Outlet } from 'react-router';

import { Footer } from '@/shared/components/layout/Footer';
import { Navbar } from '@/shared/components/layout/Navbar';

export function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
