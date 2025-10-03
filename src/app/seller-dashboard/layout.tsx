'use client';

import Link from 'next/link';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Pill, LogOut } from 'lucide-react';
import { SellerDashboardNav } from '@/components/SellerDashboardNav';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { AuthLayout } from '@/components/AuthLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';

function SellerDashboardClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <>
            <div className="md:hidden p-2 flex items-center justify-between bg-card border-b sticky top-0 z-10">
                <Link href="/seller-dashboard" className="flex items-center gap-2 font-bold">
                    <Pill className="h-7 w-7 text-primary" />
                    <h1 className="text-xl font-headline font-semibold">MediQuick Seller</h1>
                </Link>
                <SidebarTrigger />
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
                </div>
            </div>
        </>
    )
}


export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {

  return (
      <AuthLayout>
        <SidebarProvider>
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
              <Link href="/seller-dashboard" className="flex items-center gap-2 p-2 justify-start group-data-[collapsible=icon]:justify-center">
                <Pill className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-headline font-semibold group-data-[collapsible=icon]:hidden whitespace-nowrap">MediQuick Seller</h1>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SellerDashboardNav />
            </SidebarContent>
            <SidebarFooter>
                <Separator className="my-2" />
                <UserButton />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <SellerDashboardClientLayout>
              {children}
            </SellerDashboardClientLayout>
          </SidebarInset>
        </SidebarProvider>
      </AuthLayout>
  );
}

function UserButton() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const [userName, setUserName] = useState('Seller');
  const [userInitials, setUserInitials] = useState('S');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const sellerDocRef = doc(firestore, 'sellers', user.uid);
        const sellerDoc = await getDoc(sellerDocRef);
        if (sellerDoc.exists()) {
            const data = sellerDoc.data();
            setUserName(data.contactName || 'Seller');
            setUserInitials(data.contactName?.split(' ').map((n: string) => n[0]).join('') || 'S');
        }
      }
    };
    fetchUserData();
  }, [user, firestore]);
  
  const handleLogout = async () => {
    await signOut(auth);
  };
  return (
     <div className="p-2">
        <div className="flex items-center justify-between gap-3 group-data-[collapsible=icon]:justify-center p-2">
            <Link href="/seller-dashboard/profile">
              <Avatar className="h-8 w-8">
                  <AvatarImage src={''} alt={userName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                <p className="font-semibold text-sm truncate max-w-[120px]">{userName}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 group-data-[collapsible=icon]:hidden" onClick={handleLogout}>
              <LogOut className="w-4 h-4"/>
            </Button>
        </div>
    </div>
  )
}
