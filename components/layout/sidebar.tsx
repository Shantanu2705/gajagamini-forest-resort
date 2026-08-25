'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/use-auth-store';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import {
  LayoutDashboard,
  MessageSquareQuote,
  FileText,
  CalendarCheck,
  Receipt,
  Car,
  Settings,
  ShieldCheck,
  ChevronRight,
  Bus,
  Users,
  Building2,
  Utensils,
  ConciergeBell
} from 'lucide-react';

export const Sidebar: React.FC<{ className?: string; onCloseMobile?: () => void }> = ({
  className,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { settings } = useHotelStore();

  const navItems = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Calendar', href: '/calendar', icon: CalendarCheck },
    { title: 'Bookings', href: '/bookings', icon: CalendarCheck },
    { title: 'Guests', href: '/guests', icon: Users },
    { title: 'Rooms', href: '/rooms', icon: Building2 },
    { title: 'Meal Plans', href: '/meal-plans', icon: Utensils },
    { title: 'Services', href: '/services', icon: ConciergeBell },
    { title: 'Restaurant', href: '/restaurant', icon: Utensils },
    { title: 'Quotations', href: '/quotations', icon: FileText },
    { title: 'Billing', href: '/billing', icon: Receipt },
    { title: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-green-900 bg-green-900 text-white shadow-soft no-print',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center border-b border-green-800 bg-white px-6 py-6 shadow-sm z-10 relative">
        <Link href="/" className="flex flex-col items-center text-center group w-full" onClick={onCloseMobile}>
          {settings?.logoUrl ? (
            <div className="w-full flex items-center justify-center min-h-[72px] transition-transform group-hover:scale-105">
              <img 
                src={settings.logoUrl} 
                alt="Company Logo" 
                className="max-h-20 w-auto object-contain mix-blend-multiply" 
              />
            </div>
          ) : (
            <img src="/logo.png" alt="Company Logo" className="h-20 w-auto shrink-0 object-contain transition-transform group-hover:scale-105" />
          )}
          <div className="flex flex-col mt-4">
            <span className="leading-tight text-green-950 font-extrabold text-[15px] tracking-wide">
              {settings?.companyName || 'Gajagamini Forest Resort'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-green-200 uppercase">
          Core Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-yellow-600 text-white shadow-sm'
                  : 'text-green-50 hover:bg-yellow-200 hover:text-yellow-900'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-white' : 'text-green-100 group-hover:text-yellow-900'
                  )}
                />
                <span>{item.title}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4 opacity-75" />}
            </Link>
          );
        })}
      </div>

      {/* Footer User Info */}
      <div className="border-t border-green-700 p-4 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white font-bold text-xs uppercase">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-xs font-semibold text-white">{user?.name || 'Guest User'}</span>
            <span className="truncate text-[10px] text-green-200 capitalize">{user?.role || 'operator'} Role</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
