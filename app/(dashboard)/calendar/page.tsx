'use client';

import React, { useState, useMemo } from 'react';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Booking, BookingStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon, Trash2, Search, GripVertical } from 'lucide-react';
import { cn } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const LEGEND_ITEMS = [
  { label: 'Confirmed', color: 'bg-emerald-500' },
  { label: 'Pending', color: 'bg-amber-500' },
  { label: 'Checked In', color: 'bg-blue-500' },
  { label: 'Checked Out', color: 'bg-slate-500' },
  { label: 'Cancelled', color: 'bg-rose-500' },
];

const getBookingColor = (b: Booking) => {
  if (b.status === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (b.status === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (b.status === 'checked-in') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (b.status === 'checked-out') return 'bg-slate-50 text-slate-700 border-slate-200';
  
  return 'bg-emerald-50 text-emerald-700 border-emerald-100'; // confirmed
};

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const { bookings, addBooking, updateBooking, deleteBooking, roomTypes } = useHotelStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form states
  const [clientName, setClientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<BookingStatus>('confirmed');

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const lower = searchQuery.toLowerCase();
    return bookings.filter(b => 
      b.clientName?.toLowerCase().includes(lower) ||
      b.bookingNo?.toLowerCase().includes(lower)
    );
  }, [bookings, searchQuery]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
    if (viewMode === 'week') next.setDate(next.getDate() - 7);
    if (viewMode === 'day') next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
    if (viewMode === 'week') next.setDate(next.getDate() + 7);
    if (viewMode === 'day') next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title Formatting
  const headerTitle = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'day') {
      return currentDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      const startMonth = start.toLocaleString('default', { month: 'short' });
      const endMonth = end.toLocaleString('default', { month: 'short' });
      
      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      if (start.getFullYear() === end.getFullYear()) {
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()}, ${start.getFullYear()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return '';
  }, [currentDate, viewMode]);

  // Modal Handlers
  const openNewModal = (dateStr?: string) => {
    setEditingBooking(null);
    setClientName('');
    setMobile('');
    setRoomIds([]);
    const today = getLocalDateString(new Date());
    setCheckIn(dateStr || today);
    const tomorrow = new Date(dateStr || today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setCheckOut(getLocalDateString(tomorrow));
    setAmount(0);
    setAdvance(0);
    setAdults(2);
    setChildren(0);
    setNotes('');
    setStatus('confirmed');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Booking) => {
    setEditingBooking(b);
    setClientName(b.clientName || '');
    setMobile(b.mobile || '');
    setRoomIds(b.roomIds || []);
    setCheckIn(b.checkIn?.split('T')[0] || '');
    setCheckOut(b.checkOut?.split('T')[0] || '');
    setAmount(b.amount || 0);
    setAdvance(b.advance || 0);
    setAdults(b.adults || 2);
    setChildren(b.children || 0);
    setNotes(b.notes || '');
    setStatus(b.status || 'confirmed');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !checkIn || !checkOut) return;

    if (editingBooking) {
      await updateBooking({
        ...editingBooking,
        clientName,
        mobile,
        roomIds,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        amount: Number(amount),
        advance: Number(advance),
        adults: Number(adults),
        children: Number(children),
        notes,
        status,
      });
    } else {
      const newId = `cal-b-${Date.now()}`;
      await addBooking({
        id: newId,
        bookingNo: `BKG-${String(bookings.length + 101).padStart(3, '0')}`,
        clientName,
        mobile,
        guestId: '',
        roomIds,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        amount: Number(amount),
        advance: Number(advance),
        adults: Number(adults),
        children: Number(children),
        notes,
        status,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingBooking) return;
    if (window.confirm('Are you sure you want to delete this booking?')) {
      await deleteBooking(editingBooking.id);
      setIsModalOpen(false);
    }
  };

  // Rendering logic for cells
  const renderCell = (date: Date, isMonthView: boolean = true) => {
    const dateStr = getLocalDateString(date);
    const isToday = dateStr === getLocalDateString(new Date());
    
    const dayBookings = filteredBookings.filter(b => {
      if (!b.checkIn) return false;
      const start = b.checkIn.split('T')[0];
      const end = b.checkOut?.split('T')[0] || start;
      return dateStr >= start && dateStr < end; // Exclude check-out day visually in most cases, but let's just show it if they overlap
    });

    return (
      <div 
        key={dateStr} 
        className={cn(
          "border-r border-b p-1.5 transition-colors group flex flex-col bg-card relative",
          isToday && "bg-primary/5",
          isMonthView ? "min-h-[120px]" : "min-h-[300px]"
        )}
      >
        <div className="flex justify-between items-center mb-1">
          <span className={cn(
            "text-xs font-semibold px-1 rounded-sm",
            isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          )}>
            {date.getDate()}
          </span>
          <div className="flex items-center gap-1">
            {dayBookings.length > 3 && (
              <span className="text-[10px] font-medium text-muted-foreground/60">
                +{dayBookings.length - 3}
              </span>
            )}
            <div 
              className="p-1 rounded hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openNewModal(dateStr);
              }}
              title="Add booking"
            >
              <PlusCircle className="h-3 w-3 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-[2px]">
          {dayBookings.slice(0, 3).map(b => {
             const rNames = roomTypes.filter(rt => b.roomIds?.includes(rt.id)).map(r => r.name).join(', ') || 'Unassigned';
             return (
              <div
                key={b.id}
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(b);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-1.5 py-[3px] rounded-sm border cursor-pointer hover:brightness-95 transition-all text-[10px] font-medium truncate",
                  getBookingColor(b)
                )}
                title={`${b.clientName} - ${rNames}`}
              >
                <GripVertical className="h-3 w-3 opacity-40 shrink-0" />
                <div className="flex flex-col truncate leading-tight">
                  <span className="truncate font-semibold">{b.clientName} {b.mobile ? `(${b.mobile})` : ''}</span>
                  <span className="truncate text-[9px] opacity-90">{rNames}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Generate grids
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="border-r border-b bg-muted/20 p-2" />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(renderCell(new Date(year, month, i), true));
    }

    return (
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {cells}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }

    return (
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center">
          {cells.map((d, i) => (
            <div key={i} className="py-2.5 flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{DAYS_OF_WEEK[d.getDay()]}</span>
              <span className={cn(
                "text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full",
                getLocalDateString(d) === getLocalDateString(new Date()) 
                  ? "bg-primary text-primary-foreground" 
                  : "text-foreground"
              )}>
                {d.getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map(d => renderCell(d, false))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b bg-muted/40 text-center py-4">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
            {DAYS_OF_WEEK[currentDate.getDay()]}
          </span>
          <span className={cn(
            "text-xl font-bold h-10 w-10 mx-auto flex items-center justify-center rounded-full",
            getLocalDateString(currentDate) === getLocalDateString(new Date()) 
              ? "bg-primary text-primary-foreground" 
              : "text-foreground"
          )}>
            {currentDate.getDate()}
          </span>
        </div>
        <div className="grid grid-cols-1">
          {renderCell(currentDate, false)}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Header Row matching screenshot */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" onClick={handlePrev} className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday} className="h-9 rounded-full px-4 bg-muted/50 hover:bg-muted font-semibold">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight min-w-[200px]">
              {headerTitle}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search bookings..." 
                className="pl-9 rounded-full bg-muted/50 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs value={viewMode} onValueChange={(val) => setViewMode(val as ViewMode)} className="w-full sm:w-auto">
              <TabsList className="rounded-full p-1 bg-muted/50">
                <TabsTrigger value="day" className="rounded-full px-4">Day</TabsTrigger>
                <TabsTrigger value="week" className="rounded-full px-4">Week</TabsTrigger>
                <TabsTrigger value="month" className="rounded-full px-4">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={() => openNewModal()} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm ml-2 font-bold">
              <PlusCircle className="mr-1.5 h-4 w-4" /> Add Booking
            </Button>
          </div>
        </div>

        {/* Legend Row */}
        <div className="flex flex-wrap items-center gap-6 px-5 py-3 bg-muted/30 border rounded-lg mb-4">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={cn("h-3 w-3 rounded-full", item.color)} />
              <span className="text-[13px] font-medium text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}

        {/* Booking Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 bg-muted/30 border-b">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {editingBooking ? 'Edit Calendar Booking' : 'New Calendar Booking'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guest Name *</Label>
                  <Input 
                    value={clientName} 
                    onChange={e => setClientName(e.target.value)} 
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input 
                    value={mobile} 
                    onChange={e => setMobile(e.target.value)} 
                    placeholder="e.g., 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adults</Label>
                  <Input 
                    type="number"
                    value={adults} 
                    onChange={e => setAdults(Number(e.target.value))} 
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Children</Label>
                  <Input 
                    type="number"
                    value={children} 
                    onChange={e => setChildren(Number(e.target.value))} 
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(val: BookingStatus) => setStatus(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked-in">Checked In</SelectItem>
                      <SelectItem value="checked-out">Checked Out</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Room Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1 border rounded-lg p-3 max-h-32 overflow-y-auto">
                    {roomTypes.map(rt => (
                      <label key={rt.id} className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={roomIds.includes(rt.id)}
                          onChange={(e) => {
                            if (e.target.checked) setRoomIds([...roomIds, rt.id]);
                            else setRoomIds(roomIds.filter(id => id !== rt.id));
                          }}
                          className="rounded border-input"
                        />
                        {rt.name}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Check-in Date *</Label>
                  <Input 
                    type="date" 
                    value={checkIn} 
                    onChange={e => setCheckIn(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date *</Label>
                  <Input 
                    type="date" 
                    value={checkOut} 
                    onChange={e => setCheckOut(e.target.value)} 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advance Received (₹)</Label>
                  <Input 
                    type="number" 
                    value={advance} 
                    onChange={e => setAdvance(Number(e.target.value))} 
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Notes</Label>
                  <Input 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    placeholder="Any special requests..."
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 mt-6 border-t flex flex-col sm:flex-row sm:justify-between gap-4">
                {editingBooking ? (
                  <Button type="button" variant="destructive" onClick={handleDelete} className="font-semibold flex items-center gap-2 mr-auto">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2 sm:ml-auto">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground font-semibold">
                    Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
