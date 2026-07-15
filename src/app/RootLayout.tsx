import { Outlet } from 'react-router';

import { Footer } from '@/app/layout/Footer';
import { Navbar } from '@/app/layout/Navbar';

export function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
