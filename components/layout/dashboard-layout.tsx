'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuthStore } from '@/lib/store/use-auth-store';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Bus } from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, isLoading: authLoading, initialize: initAuth } = useAuthStore();
  const { fetchAll, isLoading: dataLoading } = useHotelStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!authLoading && !user && mounted) {
      router.push('/login');
    } else if (user) {
      fetchAll();
    }
  }, [user, authLoading, mounted, router, fetchAll]);

  if (!mounted || authLoading || (dataLoading && !user)) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <img src="/logo-icon.svg" alt="Logo" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-sm font-semibold text-muted-foreground animate-pulse">
            Loading Gajagamini Forest Resort Portal...
          </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-slate-50/50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar className="fixed inset-y-0 left-0 z-30" />
      </div>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative z-50 w-64 h-full animate-in slide-in-from-left duration-200">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        
        {/* Footer */}
        <footer className="mt-auto py-4 px-4 md:px-6 lg:px-8 border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
          <p className="text-center text-sm text-muted-foreground font-medium">
            Designed by{' '}
            <a 
              href="https://www.digitaldictionary.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline"
            >
              Digital Dictionary
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};
