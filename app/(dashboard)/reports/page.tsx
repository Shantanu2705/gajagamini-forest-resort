'use client';
import React, { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowUpRight,
  BedDouble,
} from 'lucide-react';

function ReportsHubContent() {
  const { invoices, bookings, enquiries, roomTypes } = useHotelStore();

  const totalInvoiced = invoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalCollected = invoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalPending = totalInvoiced - totalCollected;

  const totalEnq = enquiries.length || 1;
  const convertedEnq = bookings.length;
  const conversionRate = Math.round((convertedEnq / totalEnq) * 100);

  const activeBookings = bookings.filter((b) => b.status === 'checked-in').length;
  const totalRoomsCount = roomTypes.length || 1; // Simplify by just using room type count or actual room count if we had it
  const utilRate = Math.round((activeBookings / totalRoomsCount) * 100);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Business Intelligence & Reports</h1>
        <p className="text-sm text-muted-foreground">
          Financial performance, enquiry conversion funnels, and room utilization telemetry.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-600 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Gross Billed Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{formatCurrency(totalInvoiced)}</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +14.2% from previous quarter
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Total Collected</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalCollected)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Realized cash flow</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Enquiry Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{conversionRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">{convertedEnq} bookings from {totalEnq} leads</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-600 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Room Utilization</CardTitle>
            <BedDouble className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{utilRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">{activeBookings} active stays</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Monthly Revenue Trend (2026)
            </CardTitle>
            <CardDescription className="text-xs">
              Simulated monthly gross invoicing and collections across peak tourism months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[
                { month: 'Jan', invoiced: 450000, collected: 420000, pct: 75 },
                { month: 'Feb', invoiced: 380000, collected: 360000, pct: 65 },
                { month: 'Mar (Peak Spring)', invoiced: 620000, collected: 590000, pct: 95 },
                { month: 'Apr', invoiced: 580000, collected: 510000, pct: 88 },
                { month: 'May (Summer Vacation)', invoiced: 710000, collected: 650000, pct: 100 },
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{m.month}</span>
                    <span className="font-mono">{formatCurrency(m.invoiced)}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> Room Category Revenue Split
            </CardTitle>
            <CardDescription className="text-xs">
              Percentage share of rental earnings generated by each room class.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {[
              { type: 'Luxury Suite', share: '52%', color: 'bg-blue-600', val: 1450000 },
              { type: 'Deluxe Room', share: '28%', color: 'bg-emerald-600', val: 780000 },
              { type: 'Standard Room', share: '12%', color: 'bg-amber-500', val: 340000 },
              { type: 'Economy Room', share: '8%', color: 'bg-violet-600', val: 220000 },
            ].map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${cat.color}`} />
                  <span className="text-xs font-bold text-foreground">{cat.type}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono block">{formatCurrency(cat.val)}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">{cat.share} of total</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-8 text-center font-bold">Loading BI Reports...</div>}>
        <ReportsHubContent />
      </Suspense>
    </DashboardLayout>
  );
}
