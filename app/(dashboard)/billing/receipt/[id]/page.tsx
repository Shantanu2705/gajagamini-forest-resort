'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Receipt, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { ReceiptPdfTemplate } from '@/components/pdf/receipt-template';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, Printer, Trash2, Save, Download } from 'lucide-react';

function ReceiptEditorPageInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const { receipts, addReceipt, updateReceipt, deleteReceipt, invoices, hotelQuotations, settings } = useHotelStore();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const quotationId = searchParams.get('quotationId');

  const defaultReceiptNo = `REC-2026-${String(receipts.length + 7).padStart(4, '0')}`;

  const [receipt, setReceipt] = useState<Partial<Receipt>>({
    receiptNo: defaultReceiptNo,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientMobile: '',
    quotationNo: '',
    bookingReference: '',
    
    grandTotal: 0,
    advancePercent: 30,
    advanceAmount: 0,
    receivedAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    referenceNo: '',
    receivedBy: 'Admin',
    remarks: '',

    receiptHeading: 'Confirmation cum Advance Receipt',
    businessHouse: '',
    pax: '',
    packageType: '',
    stayDetails: '',
    checkedByName: '',
    designation: 'Manager'
  });

  useEffect(() => {
    if (!isNew) {
      const existing = receipts.find(r => r.id === id);
      if (existing) setReceipt(existing);
    } else if (quotationId) {
      const q = hotelQuotations.find(x => x.id === quotationId);
      if (q) {
        setReceipt(prev => ({
          ...prev,
          clientName: q.guestName || '',
          clientMobile: q.guestMobile || '',
          quotationNo: q.quotationNo || '',
          pax: `${q.adults || 0} Adults, ${q.children || 0} Children`,
          grandTotal: q.grandTotal || 0,
          stayDetails: `${q.checkIn ? q.checkIn.split('T')[0] : ''} to ${q.checkOut ? q.checkOut.split('T')[0] : ''}`,
        }));
      }
    }
  }, [isNew, id, receipts, quotationId, hotelQuotations]);

  // Auto calculate advance amount based on percent
  useEffect(() => {
    const total = Number(receipt.grandTotal) || 0;
    const percent = Number(receipt.advancePercent) || 0;
    const calcAdvance = Math.round((total * percent) / 100);
    if (receipt.advanceAmount !== calcAdvance) {
      setReceipt(prev => ({ ...prev, advanceAmount: calcAdvance, receivedAmount: calcAdvance }));
    }
  }, [receipt.grandTotal, receipt.advancePercent]);

  const handleUpdate = (field: keyof Receipt, value: any) => {
    setReceipt(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload: Receipt = {
      ...receipt,
      id: isNew ? `rec-${Date.now()}` : id,
      receiptNo: receipt.receiptNo || defaultReceiptNo,
      clientName: receipt.clientName || 'Unknown Guest',
      amount: Number(receipt.receivedAmount) || 0,
      paymentMethod: (receipt.paymentMethod as PaymentMethod) || 'UPI'
    } as Receipt;

    if (isNew) {
      await addReceipt(payload);
    } else {
      await updateReceipt(payload);
    }
    window.alert(`Advance Receipt created for: ${payload.receiptNo}`);
    router.push('/billing?tab=receipts');
  };

  const grandTotal = Number(receipt.grandTotal) || 0;
  const advancePercent = Number(receipt.advancePercent) || 0;
  const calculatedAdvance = Math.round((grandTotal * advancePercent) / 100);
  const advanceReceived = Number(receipt.receivedAmount) || 0;
  const balance = grandTotal - advanceReceived;

  return (
    <DashboardLayout>
      <div className="bg-[#effdf5] min-h-[calc(100vh-64px)] -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/billing')} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center text-sm font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1" /> Billing
              </button>
              <h1 className="text-2xl font-bold text-[#0f172a]">{balance <= 0 ? 'Full Payment' : 'Advance'} Receipt {receipt.receiptNo}</h1>
            </div>
            <div className="flex items-center gap-2">
              {!isNew && (
                <Button onClick={() => { deleteReceipt(id); router.push('/billing'); }} variant="outline" size="sm" className="bg-white rounded-full font-semibold px-4 h-9 shadow-sm border-gray-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSave} className="bg-white rounded-full font-semibold px-4 h-9 shadow-sm border-gray-200">
                <Save className="w-4 h-4 mr-1.5" /> Save
              </Button>
              <Button size="sm" onClick={() => setIsPreviewOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 rounded-full font-bold px-5 h-9 shadow-none border-0">
                <Download className="w-4 h-4 mr-1.5" /> Download PDF
              </Button>
            </div>
          </div>

          {/* PDF Preview Modal */}
          {isPreviewOpen && (
            <PdfPreviewModal
              isOpen={isPreviewOpen}
              onClose={() => setIsPreviewOpen(false)}
              title="Official Receipt"
              documentNo={receipt.receiptNo}
            >
              <ReceiptPdfTemplate receipt={receipt} settings={settings} />
            </PdfPreviewModal>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Form Content */}
            <div className="flex-1 space-y-6">
              
              {/* Receipt Information */}
              <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-5">
                <h2 className="text-[13px] font-bold text-gray-800">Receipt information</h2>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Receipt number</Label>
                    <Input value={receipt.receiptNo || ''} onChange={e => handleUpdate('receiptNo', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 font-mono text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Receipt date</Label>
                    <Input type="date" value={receipt.date || ''} onChange={e => handleUpdate('date', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Guest name</Label>
                    <Input value={receipt.clientName || ''} onChange={e => handleUpdate('clientName', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Mobile number</Label>
                    <Input value={receipt.clientMobile || ''} onChange={e => handleUpdate('clientMobile', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Quotation number</Label>
                    <Input value={receipt.quotationNo || ''} onChange={e => handleUpdate('quotationNo', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Booking reference</Label>
                    <Input value={receipt.bookingReference || ''} onChange={e => handleUpdate('bookingReference', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-5">
                <h2 className="text-[13px] font-bold text-gray-800">Payment information</h2>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Grand total (₹)</Label>
                    <Input type="number" value={receipt.grandTotal || ''} onChange={e => handleUpdate('grandTotal', Number(e.target.value))} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Advance %</Label>
                    <Input type="number" value={receipt.advancePercent || ''} onChange={e => handleUpdate('advancePercent', Number(e.target.value))} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Advance amount (₹)</Label>
                    <Input type="number" value={receipt.advanceAmount || ''} onChange={e => handleUpdate('advanceAmount', Number(e.target.value))} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Received amount (₹)</Label>
                    <Input type="number" value={receipt.receivedAmount || ''} onChange={e => handleUpdate('receivedAmount', Number(e.target.value))} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Payment date</Label>
                    <Input type="date" value={receipt.paymentDate || ''} onChange={e => handleUpdate('paymentDate', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Payment mode</Label>
                    <Select value={receipt.paymentMethod} onValueChange={v => handleUpdate('paymentMethod', v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Reference / UTR number</Label>
                    <Input value={receipt.referenceNo || ''} onChange={e => handleUpdate('referenceNo', e.target.value)} placeholder="Optional" className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Received by</Label>
                    <Input value={receipt.receivedBy || ''} onChange={e => handleUpdate('receivedBy', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Remarks</Label>
                    <Textarea value={receipt.remarks || ''} onChange={e => handleUpdate('remarks', e.target.value)} className="min-h-[80px] rounded-xl bg-gray-50/50 border-gray-200 text-[14px] resize-none" />
                  </div>
                </div>
              </Card>

              {/* Confirmation Receipt Details */}
              <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-5">
                <h2 className="text-[13px] font-bold text-gray-800">Confirmation receipt details</h2>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-gray-500 font-medium">Receipt heading</Label>
                    <Select value={receipt.receiptHeading} onValueChange={v => handleUpdate('receiptHeading', v)}>
                      <SelectTrigger className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Confirmation cum Advance Receipt">Confirmation cum Advance Receipt</SelectItem>
                        <SelectItem value="Final Payment Receipt">Final Payment Receipt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-gray-500 font-medium">Business / Company</Label>
                      <Input value={receipt.businessHouse || ''} onChange={e => handleUpdate('businessHouse', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-gray-500 font-medium">Pax</Label>
                      <Input value={receipt.pax || ''} onChange={e => handleUpdate('pax', e.target.value)} placeholder="e.g. 02 Adults" className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-gray-500 font-medium">Package</Label>
                      <Input value={receipt.packageType || ''} onChange={e => handleUpdate('packageType', e.target.value)} placeholder="e.g. Room Only" className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className="text-[12px] text-gray-500 font-medium">Stay</Label>
                      <Input value={receipt.stayDetails || ''} onChange={e => handleUpdate('stayDetails', e.target.value)} placeholder="e.g. 2026-08-20 to 2026-08-22" className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-gray-500 font-medium">Checked By (name)</Label>
                      <Input value={receipt.checkedByName || ''} onChange={e => handleUpdate('checkedByName', e.target.value)} placeholder="e.g. Admin" className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-gray-500 font-medium">Designation</Label>
                      <Input value={receipt.designation || ''} onChange={e => handleUpdate('designation', e.target.value)} placeholder="Manager" className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                    </div>
                  </div>
                </div>
              </Card>

            </div>

            {/* Right Sidebar - Payment Summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="sticky top-6">
                <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-4">
                  <h2 className="text-[14px] font-bold text-gray-900 pb-2 border-b border-gray-100">Payment summary</h2>
                  
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-[13px] text-gray-600">
                      <span>Grand Total</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] text-gray-600">
                      <span>Advance ({advancePercent}%)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(calculatedAdvance)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center text-[13px] text-gray-500">
                      <span>Advance Received</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(advanceReceived)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px] font-bold">
                      <span className="text-gray-900">Balance Payable</span>
                      <span className="text-rose-600">{formatCurrency(balance)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ReceiptEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ReceiptEditorPageInner />
    </Suspense>
  );
}
