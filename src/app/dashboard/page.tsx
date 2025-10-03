'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function DashboardRedirector() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }

    if (!user) {
      router.replace('/login');
      return;
    }

    const checkUserRole = async () => {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'customer') {
                router.replace('/dashboard/home');
            } else if (userData.role === 'doctor') {
                router.replace('/doctor-dashboard');
            } else {
                // Fallback for any other user role if needed
                router.replace('/dashboard/home');
            }
        } else {
           const sellerDocRef = doc(firestore, 'sellers', user.uid);
           const sellerDoc = await getDoc(sellerDocRef);
            if (sellerDoc.exists()) {
                 router.replace('/seller-dashboard');
            } else {
                // Default to customer dashboard if no specific role doc is found
                router.replace('/dashboard/home');
            }
        }
      }
    };

    checkUserRole();
  }, [user, isUserLoading, router, firestore]);

  return <LoadingScreen isLoading={true} />;
}
