
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Home, ShoppingCart, Beaker, BarChart3, Users, UserCircle, ShoppingBag, Heart, Stethoscope, CalendarDays, ScanText } from 'lucide-react';

const menuItems = [
  { href: '/dashboard/home', label: 'Home', icon: Home },
  { href: '/dashboard/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/prescription-analysis', label: 'Prescription Analysis', icon: ScanText },
  { href: '/dashboard/interaction-checker', label: 'Drug Checker', icon: Beaker },
  { href: '/dashboard/health-dashboard', label: 'Health Dashboard', icon: BarChart3 },
  { href: '/dashboard/home-tests', label: 'Home Tests', icon: Heart },
  { href: '/dashboard/consult-doctor', label: 'Consult a Doctor', icon: Stethoscope },
  { href: '/dashboard/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/dashboard/community', label: 'Community', icon: Users },
  { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <SidebarMenu>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard/home');
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
