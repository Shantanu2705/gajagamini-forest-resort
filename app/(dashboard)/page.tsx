'use client';
import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Users,
  MessageSquareQuote,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  FileText,
  ArrowUpRight,
  BedDouble,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { guests, roomTypes, enquiries, bookings, invoices, hotelQuotations, settings } = useHotelStore();

  const totalRooms = roomTypes.reduce((acc, curr) => acc + (curr.maxOccupancy || 1), 0);
  const activeBookings = bookings.filter((b) => b.status === 'checked-in').length;
  
  const newEnquiries = enquiries.filter((e) => e.status === 'new' || e.status === 'follow-up').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  const totalRevenue = invoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const pendingCollections = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'partially-paid' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.balanceAmount || 0), 0);

  const recentEnquiries = enquiries.slice(0, 5);
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Executive Overview</h1>
            <p className="text-sm text-muted-foreground">
              Live operational overview, room status, and financial metrics for {settings?.companyName || 'Gajagamini Forest Resort'}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/enquiries">
              <Button size="sm" className="bg-primary text-primary-foreground font-semibold shadow-sm">
                <PlusCircle className="mr-1.5 h-4 w-4" /> New Enquiry
              </Button>
            </Link>
            <Link href="/quotations/new">
              <Button size="sm" variant="outline" className="font-semibold border-primary/20 hover:bg-primary/5">
                <FileText className="mr-1.5 h-4 w-4 text-primary" /> Smart Quote
              </Button>
            </Link>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="border-l-4 border-l-blue-600 shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Available Rooms</CardTitle>
              <BedDouble className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold">{totalRooms > 0 ? totalRooms - activeBookings : 0} / {totalRooms || 0}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Ready for check-in</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-600 shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Active Guests</CardTitle>
              <Users className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold">{activeBookings} / {guests.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Currently checked-in</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Open Enquiries</CardTitle>
              <MessageSquareQuote className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold">{newEnquiries}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Requiring follow-up</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-600 shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Confirmed Bookings</CardTitle>
              <CalendarCheck className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold">{confirmedBookings}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Scheduled check-ins</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-violet-600 shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Total Invoiced</CardTitle>
              <TrendingUp className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-foreground truncate">{formatCurrency(totalRevenue)}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Gross billed volume</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Pending Dues</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-extrabold text-red-600 dark:text-red-400 truncate">
                {formatCurrency(pendingCollections)}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Unpaid balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Module Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/quotations">
            <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground group-hover:text-primary transition-colors">
                  Quotations Hub
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-lg font-bold mt-1">{hotelQuotations.length} Proposals</div>
            </Card>
          </Link>

          <Link href="/billing">
            <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground group-hover:text-primary transition-colors">
                  Billing & QR Pay
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-lg font-bold mt-1">{invoices.length} Invoices</div>
            </Card>
          </Link>

          <Link href="/rooms">
            <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground group-hover:text-primary transition-colors">
                  Rooms Master
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-lg font-bold mt-1">{roomTypes.length} Room Types</div>
            </Card>
          </Link>

          <Link href="/meal-plans">
            <Card className="p-4 hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-card to-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-muted-foreground group-hover:text-primary transition-colors">
                  Meal Plans
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="text-lg font-bold mt-1">Active Plans</div>
            </Card>
          </Link>
        </div>

        {/* Tables Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Enquiries Table */}
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquareQuote className="h-4 w-4 text-primary" />
                  Recent Room & Event Enquiries
                </CardTitle>
                <CardDescription className="text-xs">
                  Latest customer inquiries received across WhatsApp, email, and phone.
                </CardDescription>
              </div>
              <Link href="/enquiries">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                  View All ({enquiries.length})
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Customer</TableHead>
                    <TableHead>Details & Room</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No enquiries recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentEnquiries.map((e) => {
                      const roomType = roomTypes.find(r => r.id === e.roomTypeId);
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="font-semibold text-foreground">
                            <div className="truncate max-w-[130px]">{e.customerName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{e.mobile}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-[10px] text-primary font-semibold">{roomType?.name || 'Standard Room'}</div>
                            <div className="text-xs text-muted-foreground">
                              {e.adults} Adults, {e.children} Children
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            <div className="font-semibold">{formatDate(e.checkIn)}</div>
                            <div className="text-[10px] text-muted-foreground">to {formatDate(e.checkOut)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={e.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Upcoming Bookings Table */}
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-600" />
                  Upcoming Check-ins & Active Stays
                </CardTitle>
                <CardDescription className="text-xs">
                  Confirmed bookings currently active or scheduled for check-in.
                </CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                  View All ({bookings.length})
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest & Room</TableHead>
                    <TableHead>Stay Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No upcoming bookings scheduled.
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingBookings.map((b) => {
                      const assignedRooms = roomTypes.filter(r => b.roomIds?.includes(r.id)).map(r => r.name).join(', ') || 'Unassigned';
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="font-semibold text-foreground">
                            <div className="truncate max-w-[130px]">{b.clientName}</div>
                            <div className="text-[10px] text-primary font-medium">{assignedRooms}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-semibold">In: {formatDate(b.checkIn)}</div>
                            <div className="text-[10px] text-muted-foreground">Out: {formatDate(b.checkOut)}</div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-foreground">
                            {formatCurrency(b.amount)}
                            <div className="mt-0.5">
                              <StatusBadge status={b.status} className="text-[9px] px-1.5 py-0" />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
