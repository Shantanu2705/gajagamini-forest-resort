'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Edit, Trash2, FileText, Download, MessageCircle } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/utils/formatters';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { QuotationPdfTemplate } from '@/components/pdf/quotation-template';
import { HotelQuotation } from '@/types';

export default function QuotationsHub() {
  const router = useRouter();
  const { hotelQuotations, deleteQuotation, fetchAll, isLoading, settings } = useHotelStore();
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [searchTerm, setSearchTerm] = useState('');
  const [previewQuotation, setPreviewQuotation] = useState<HotelQuotation | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      await deleteQuotation(id);
    }
  };

  const handleWhatsApp = (docNo: string) => {
    const text = encodeURIComponent(`Hello, here is your quotation: ${docNo}`);
    window.open(`https://wa.me/916292114000?text=${text}`, '_blank');
  };

  const filtered = hotelQuotations.filter(q => 
    q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.guestName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Quotations
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage guest quotations and generate PDFs.</p>
        </div>
        <Button onClick={() => router.push('/quotations/new')} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by ID or Guest Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50/50"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Quotation No</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Stay Dates</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading quotations...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No quotations found</TableCell></TableRow>
              ) : (
                filtered.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell className="font-medium text-gray-900">{quotation.quotationNo}</TableCell>
                    <TableCell className="text-gray-600">
                      <div>{quotation.guestName}</div>
                      <div className="text-xs text-gray-400">{quotation.guestMobile}</div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(quotation.checkIn)} to {formatDate(quotation.checkOut)}
                      <div className="text-xs text-gray-400">{quotation.nights} Nights</div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">₹{quotation.grandTotal.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={quotation.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPreviewQuotation(quotation)}>
                          <FileText className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleWhatsApp(quotation.quotationNo)} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" title="Send via WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/quotations/new?editId=${quotation.id}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(quotation.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      {previewQuotation && (
        <PdfPreviewModal
          isOpen={!!previewQuotation}
          onClose={() => setPreviewQuotation(null)}
          title={`Quotation - ${previewQuotation.quotationNo}`}
          documentNo={previewQuotation.quotationNo}
        >
          <QuotationPdfTemplate quotation={previewQuotation} settings={settings || null} />
        </PdfPreviewModal>
      )}
    </DashboardLayout>
  );
}
