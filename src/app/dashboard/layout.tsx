
'use client';

import Link from 'next/link';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Pill, Leaf, MessageCircleQuestion, Users, LogOut } from 'lucide-react';
import { DashboardNav } from '@/components/DashboardNav';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SymptomCheckerDialog } from '@/components/SymptomCheckerDialog';
import { DashboardClientLayout } from './DashboardClientLayout';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
      <AuthLayout>
        <SidebarProvider>
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
              <Link href="/dashboard" className="flex items-center gap-2 p-2 justify-start group-data-[collapsible=icon]:justify-center">
                <Pill className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-headline font-semibold group-data-[collapsible=icon]:hidden whitespace-nowrap">MediQuick</h1>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <DashboardNav />
            </SidebarContent>
            <SidebarFooter className="group-data-[collapsible=icon]:p-0">
                <Separator className="my-2" />
                <Card className="m-2 shadow-none border-dashed group-data-[collapsible=icon]:hidden">
                    <CardHeader className="p-3">
                      <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4"/> Community Health</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-sm text-muted-foreground">
                      <p>Connect with other patients and share experiences in real-time.</p>
                    </CardContent>
                </Card>
                <UserButton />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <DashboardClientLayout>
              {children}
            </DashboardClientLayout>

                <div className="fixed bottom-4 right-4">
                  <Button size="sm" variant="outline" className="shadow-lg rounded-full h-auto py-1 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:text-green-900">
                    <Leaf className="w-4 h-4" />
                    <span className="text-xs">Green Pharma Initiative</span>
                  </Button>
                </div>
                <SymptomCheckerDialog>
                  <div className="fixed bottom-4 left-4 md:left-[calc(var(--sidebar-width-icon)+1rem)] transition-all duration-200 peer-data-[state=expanded]:md:left-[calc(var(--sidebar-width)+1rem)]">
                    <Button size="icon" className="rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 scale-100 hover:scale-105 transition-transform text-white">
                      <MessageCircleQuestion className="w-6 h-6" />
                      <span className="sr-only">AI Symptom Checker</span>
                    </Button>
                  </div>
                </SymptomCheckerDialog>
          </SidebarInset>
        </SidebarProvider>
      </AuthLayout>
  );
}

function UserButton() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        let name = '';
        let initials = '';

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          name = `${data.firstName} ${data.lastName}`;
          initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`;
        } else {
          const sellerDocRef = doc(firestore, 'sellers', user.uid);
          const sellerDoc = await getDoc(sellerDocRef);
          if (sellerDoc.exists()) {
            const data = sellerDoc.data();
            name = data.contactName;
            initials = data.contactName?.split(' ').map((n: string) => n[0]).join('') || '';
          }
        }
        
        if (name) {
            setUserName(name);
        }
        if (initials) {
            setUserInitials(initials);
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
            <Link href="/dashboard/profile">
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
