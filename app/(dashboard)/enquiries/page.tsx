'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Enquiry, EnquiryStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/components/ui/button';
import { formatDate } from '@/utils/formatters';
import { PlusCircle, Search, Trash2, Sparkles, Filter, Calendar as CalendarIcon, Users } from 'lucide-react';

function EnquiriesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { enquiries, roomTypes, addEnquiry, updateEnquiry, deleteEnquiry, isInitialized } = useHotelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [checkIn, setCheckIn] = useState(new Date().toISOString().split('T')[0]);
  
  // Set default check-out to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkOut, setCheckOut] = useState(tomorrow.toISOString().split('T')[0]);
  
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [roomTypeId, setRoomTypeId] = useState<string>('any');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState<EnquiryStatus>('new');

  const openNewModal = () => {
    setEditingEnquiry(null);
    setCustomerName('');
    setMobile('');
    setWhatsapp('');
    setEmail('');
    setCheckIn(new Date().toISOString().split('T')[0]);
    setCheckOut(tomorrow.toISOString().split('T')[0]);
    setAdults(2);
    setChildren(0);
    setRoomTypeId('any');
    setSpecialRequirements('');
    setInternalNotes('');
    setEnquiryStatus('new');
    setIsModalOpen(true);
  };

  const openEditModal = (e: Enquiry) => {
    setEditingEnquiry(e);
    setCustomerName(e.customerName || '');
    setMobile(e.mobile || '');
    setWhatsapp(e.whatsapp || '');
    setEmail(e.email || '');
    setCheckIn(e.checkIn?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setCheckOut(e.checkOut?.split('T')[0] || tomorrow.toISOString().split('T')[0]);
    setAdults(e.adults || 2);
    setChildren(e.children || 0);
    setRoomTypeId(e.roomTypeId || 'any');
    setSpecialRequirements(e.specialRequirements || '');
    setInternalNotes(e.internalNotes || '');
    setEnquiryStatus(e.status || 'new');
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isInitialized && editId && enquiries.length > 0) {
      const enq = enquiries.find(e => e.id === editId);
      if (enq && !isModalOpen) {
        openEditModal(enq);
        router.replace('/enquiries');
      }
    }
  }, [isInitialized, editId, enquiries, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !mobile) return;

    if (editingEnquiry) {
      await updateEnquiry({
        ...editingEnquiry,
        customerName,
        mobile,
        whatsapp,
        email,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        adults: Number(adults),
        children: Number(children),
        roomTypeId: roomTypeId === 'any' ? undefined : roomTypeId,
        specialRequirements,
        internalNotes,
        status: enquiryStatus,
      });
    } else {
      const newId = `enq-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const nextNum = enquiries.length + 1;
      
      await addEnquiry({
        id: newId,
        enquiryNo: `ENQ-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`,
        customerName,
        mobile,
        whatsapp,
        email,
        checkIn: new Date(checkIn).toISOString(),
        checkOut: new Date(checkOut).toISOString(),
        adults: Number(adults),
        children: Number(children),
        roomTypeId: roomTypeId === 'any' ? undefined : roomTypeId,
        specialRequirements,
        internalNotes,
        status: enquiryStatus,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleConvertToQuotation = (enq: Enquiry) => {
    router.push(`/quotations/new?enquiryId=${enq.id}`);
  };

  const filtered = enquiries.filter((e) => {
    const matchesSearch =
      (e.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.mobile || '').includes(searchTerm) ||
      (e.enquiryNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hotel Enquiries & Leads</h1>
            <p className="text-sm text-muted-foreground">
              Manage incoming room requests and booking inquiries.
            </p>
          </div>
          <Button onClick={openNewModal} className="bg-primary text-primary-foreground font-semibold shadow-sm">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Log New Enquiry
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 shadow-soft">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <div className="flex flex-wrap gap-1">
                {['all', 'new', 'follow-up', 'quotation-sent', 'confirmed', 'cancelled'].map((st) => (
                  <Button
                    key={st}
                    variant={statusFilter === st ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(st)}
                    className="h-8 text-xs capitalize"
                  >
                    {st.replace(/-/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Enquiries Table */}
        <Card className="shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-0">
                <TableHead className="font-semibold text-gray-700 text-[13px] h-11">Enquiry No</TableHead>
                <TableHead className="font-semibold text-gray-700 text-[13px] h-11">Customer</TableHead>
                <TableHead className="font-semibold text-gray-700 text-[13px] h-11">Room Type</TableHead>
                <TableHead className="font-semibold text-gray-700 text-[13px] h-11">Guests</TableHead>
                <TableHead className="font-semibold text-gray-700 text-[13px] h-11">Stay Dates</TableHead>
                <TableHead className="font-semibold text-gray-700 text-[13px] h-11">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 text-[13px] h-11">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No matching enquiries found. Log a new enquiry to get started!
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => {
                  const rType = roomTypes.find(r => r.id === e.roomTypeId);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="text-[12px] font-medium text-gray-500">
                        {e.enquiryNo}
                      </TableCell>
                      <TableCell>
                        <div 
                          onClick={() => router.push(`/enquiries/${e.id}`)}
                          className="font-bold text-[13px] text-foreground cursor-pointer hover:underline"
                        >
                          {e.customerName}
                        </div>
                        <div className="text-[12px] text-muted-foreground mt-0.5">
                          {e.mobile}
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] font-medium">
                        {rType?.name || 'Any Room'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{e.adults}A, {e.children}C</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] font-medium">
                        <div className="flex flex-col">
                          <span>{formatDate(e.checkIn)}</span>
                          <span className="text-[10px] text-muted-foreground">to {formatDate(e.checkOut)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={e.status} onValueChange={(val) => updateEnquiry({ ...e, status: val as any })}>
                          <SelectTrigger className="border-0 h-8 px-3 py-0 rounded-full text-[11px] font-bold focus:ring-0 shadow-none text-left flex items-center justify-between min-w-[125px] bg-muted">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="quotation-sent">Quotation Sent</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(e)}
                            className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleConvertToQuotation(e)}
                            className="flex items-center justify-center gap-1.5 h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] font-bold transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" /> Quote
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this enquiry?")) {
                                deleteEnquiry(e.id);
                              }
                            }}
                            className="flex items-center justify-center h-8 w-8 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Enquiry Create / Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-2xl p-0 bg-background border rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <DialogHeader className="px-6 py-5 border-b border-border bg-muted/30">
              <DialogTitle className="text-[20px] font-bold">
                {editingEnquiry ? 'Edit Enquiry' : 'Log New Enquiry'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-6 px-6 py-5 overflow-y-auto custom-scrollbar flex-1">
              
              {/* CUSTOMER */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Guest Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Name</Label>
                    <Input required className="h-10 rounded-[12px] text-[14px]" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Mobile</Label>
                    <Input required className="h-10 rounded-[12px] text-[14px]" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">WhatsApp (Optional)</Label>
                    <Input className="h-10 rounded-[12px] text-[14px]" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Email (Optional)</Label>
                    <Input type="email" className="h-10 rounded-[12px] text-[14px]" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* STAY DETAILS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stay Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Check-in Date</Label>
                    <Input type="date" className="h-10 rounded-[12px] text-[14px]" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Check-out Date</Label>
                    <Input type="date" className="h-10 rounded-[12px] text-[14px]" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Adults</Label>
                    <Input type="number" min={1} className="h-10 rounded-[12px] text-[14px]" value={adults} onChange={(e) => setAdults(Number(e.target.value))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Children</Label>
                    <Input type="number" min={0} className="h-10 rounded-[12px] text-[14px]" value={children} onChange={(e) => setChildren(Number(e.target.value))} />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-[13px] font-semibold">Preferred Room Type</Label>
                    <Select value={roomTypeId} onValueChange={setRoomTypeId}>
                      <SelectTrigger className="h-10 rounded-[12px] text-[14px]"><SelectValue placeholder="Any Room Type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any / Undecided</SelectItem>
                        {roomTypes.map(rt => (
                          <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* ADDITIONAL DETAILS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Additional details</h4>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Special requirements</Label>
                    <Textarea className="rounded-[16px] min-h-[80px] resize-none text-[14px]" value={specialRequirements} onChange={(e) => setSpecialRequirements(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Internal notes</Label>
                    <Textarea className="rounded-[16px] min-h-[80px] resize-none text-[14px]" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold">Status</Label>
                    <Select value={enquiryStatus} onValueChange={setEnquiryStatus as any}>
                      <SelectTrigger className="h-10 rounded-[12px] text-[14px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="quotation-sent">Quotation-sent</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-muted/10 px-6 py-4 flex justify-end gap-3 rounded-b-xl shrink-0 mt-2">
                <Button type="button" variant="outline" className="rounded-full px-6 font-semibold" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="rounded-full px-7 font-bold">
                  {editingEnquiry ? 'Save Changes' : 'Save Enquiry'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function EnquiriesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <EnquiriesPageInner />
    </Suspense>
  );
}
