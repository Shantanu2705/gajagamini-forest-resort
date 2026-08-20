'use client';
import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Edit, Sparkles, Phone, Mail, Users, Calendar as CalendarIcon, BedDouble, MessageSquareQuote } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export default function EnquiryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { enquiries, roomTypes, isInitialized } = useHotelStore();
  
  if (!isInitialized) return null;
  
  const enquiry = enquiries.find(e => e.id === id);
  if (!enquiry) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">Enquiry not found</div>
      </DashboardLayout>
    );
  }

  const roomType = roomTypes.find(r => r.id === enquiry.roomTypeId);

  const formatStatus = (status: string) => {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/20 p-6 lg:p-8 pt-[32px]">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/enquiries')}
              className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Enquiries
            </button>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push(`/enquiries?edit=${enquiry.id}`)}
                variant="outline" 
                className="h-9 px-5 rounded-full font-bold shadow-sm"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button 
                onClick={() => router.push(`/quotations/new?enquiryId=${enquiry.id}`)}
                className="h-9 px-5 rounded-full font-bold shadow-sm"
              >
                <Sparkles className="h-4 w-4 mr-1.5" /> Generate quotation
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            
            {/* Main Info Card */}
            <Card className="border shadow-sm rounded-[24px]">
              <CardContent className="p-8 space-y-8">
                
                {/* Header Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{enquiry.customerName}</h1>
                    <span className="px-3 py-1 rounded-full border text-[11px] font-bold bg-muted/50">
                      {formatStatus(enquiry.status || '')}
                    </span>
                    <span className="px-3 py-1 rounded-full border text-[11px] font-bold bg-muted/50">
                      {enquiry.enquiryNo}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5" /> Room Type
                    </div>
                    <div className="text-[15px] font-medium">{roomType?.name || 'Any Room Type'}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" /> Stay Dates
                    </div>
                    <div className="text-[15px] font-medium">
                      {formatDate(enquiry.checkIn)} to {formatDate(enquiry.checkOut)}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Guests
                    </div>
                    <div className="text-[15px] font-medium">
                      {enquiry.adults} Adults, {enquiry.children} Children
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 border-t pt-6">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Special Requirements</div>
                  <div className="text-[15px] font-medium">{enquiry.specialRequirements || '—'}</div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Internal Notes</div>
                  <div className="text-[15px] font-medium">{enquiry.internalNotes || '—'}</div>
                </div>

              </CardContent>
            </Card>

            {/* Contact Card */}
            <div className="space-y-4">
              <Card className="border shadow-sm rounded-[24px]">
                <CardContent className="p-6">
                  <h3 className="text-[15px] font-bold mb-5">Contact Details</h3>
                  
                  <div className="space-y-3">
                    {enquiry.mobile ? (
                      <a href={`tel:${enquiry.mobile.replace(/\D/g, '')}`} className="flex items-center gap-3 p-3.5 rounded-[16px] border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                        <Phone className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-[14px] font-medium group-hover:text-primary transition-colors">{enquiry.mobile}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 rounded-[16px] border bg-card opacity-50">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span className="text-[14px] font-medium">—</span>
                      </div>
                    )}
                    
                    {enquiry.whatsapp ? (
                      <a href={`https://wa.me/${enquiry.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 rounded-[16px] border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                        <MessageSquareQuote className="h-4 w-4 text-green-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-[14px] font-medium group-hover:text-green-600 transition-colors">{enquiry.whatsapp}</span>
                      </a>
                    ) : null}

                    {enquiry.email ? (
                      <a href={`mailto:${enquiry.email}`} className="flex items-center gap-3 p-3.5 rounded-[16px] border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                        <Mail className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-[14px] font-medium group-hover:text-primary transition-colors">{enquiry.email}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-3.5 rounded-[16px] border bg-card opacity-50">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="text-[14px] font-medium">—</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 text-[11px] font-medium text-muted-foreground">
                    Created {new Date(enquiry.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
