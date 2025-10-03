'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Home, UserCircle, Calendar } from 'lucide-react';

const menuItems = [
  { href: '/doctor-dashboard', label: 'Dashboard', icon: Home },
  { href: '/doctor-dashboard/appointments', label: 'Appointments', icon: Calendar },
  { href: '/doctor-dashboard/profile', label: 'Profile', icon: UserCircle },
];

export function DoctorDashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <SidebarMenu>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
