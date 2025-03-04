'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('auth');
    if (!isAuthenticated && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, []);

  return <>{children}</>;
}
