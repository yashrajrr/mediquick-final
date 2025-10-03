
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingScreen } from './LoadingScreen';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, hasMounted]);

  if (!hasMounted || isUserLoading || !user) {
    return <LoadingScreen isLoading={true} />;
  }

  return <>{children}</>;
}
