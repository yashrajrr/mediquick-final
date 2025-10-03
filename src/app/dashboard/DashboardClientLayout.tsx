
'use client';

import Link from 'next/link';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Pill } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <>
            <div className="md:hidden p-2 flex items-center justify-between bg-card border-b sticky top-0 z-10">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold">
                    <Pill className="h-7 w-7 text-primary" />
                    <h1 className="text-xl font-headline font-semibold">MediQuick</h1>
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
