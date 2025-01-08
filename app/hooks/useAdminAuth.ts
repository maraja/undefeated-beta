'use client';

import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      // still loading
      // router.push('/login');
    } else if (!user.isAdmin) {
      router.push('/dashboard');
    }
  }, [user]);

  return user?.isAdmin || false;
}
