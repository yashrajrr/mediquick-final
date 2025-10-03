
'use client';

import { Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-1000',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="relative flex flex-col items-center justify-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute h-full w-full animate-pulse-slow rounded-full bg-primary/10"></div>
            <div className="absolute h-16 w-16 animate-pulse-slower rounded-full bg-primary/20"></div>
            <Pill className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-2xl font-headline font-semibold text-primary">
            <span>MediQuick</span>
        </div>
        <p className="text-muted-foreground animate-pulse">Preparing your experience...</p>
      </div>
    </div>
  );
}
