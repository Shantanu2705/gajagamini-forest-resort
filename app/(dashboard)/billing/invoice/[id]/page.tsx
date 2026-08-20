'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Invoice, InvoiceItem, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { InvoicePdfTemplate } from '@/components/pdf/invoice-template';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, Printer, Trash2, Save, Download, Plus, Trash } from 'lucide-react';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

function InvoiceEditorPageInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isNew = id === 'new';

  const { invoices, addInvoice, updateInvoice, deleteInvoice, hotelQuotations, bookings, settings } = useHotelStore();
  const quotationId = searchParams.get('quotationId');
  const bookingId = searchParams.get('bookingId');
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const defaultInvoiceNo = `INV-2026-${String(invoices.length + 101).padStart(3, '0')}`;

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    invoiceNo: defaultInvoiceNo,
    hasGst: true,
    status: 'unpaid',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentTerms: 'Due on Receipt',
    clientName: '',
    clientGstin: '',
    clientState: 'West Bengal',
    supplyType: 'Intra-State (CGST + SGST)',
    billingAddress: '',
    items: [{
      id: Math.random().toString(36).substring(2, 9),
      dateFrom: '',
      dateTo: '',
      serviceDetails: '',
      hsnSac: '998552',
      quantity: 1,
      rate: 0,
      discountPercent: 0,
      gstPercent: 12,
    }],
    disclaimerNote: '',
    roundOff: 0,
    advanceReceived: 0,
    placeOfIssue: 'Hotel Reception',
    signatoryName: 'Admin',
    extraNote: ''
  });

  useEffect(() => {
    if (!isNew) {
      const existing = invoices.find(i => i.id === id);
      if (existing) setInvoice(existing);
    } else if (quotationId) {
      const q = hotelQuotations.find(x => x.id === quotationId);
      if (q) {
        setInvoice(prev => ({
          ...prev,
          clientName: q.guestName || '',
          clientPhone: q.guestMobile || '',
          clientState: 'West Bengal',
          items: [{
            id: Math.random().toString(36).substring(2, 9),
            serviceDetails: `Hotel Stay For\n${q.guestName}`,
            hsnSac: '998552',
            quantity: 1,
            rate: q.grandTotal || 0,
            discountPercent: 0,
            gstPercent: 12,
          }],
        }));
      }
    } else if (bookingId) {
      const b = bookings.find(x => x.id === bookingId);
      if (b) {
        setInvoice(prev => ({
          ...prev,
          clientName: b.clientName || '',
          advanceReceived: b.advance || 0,
          items: [{
            id: Math.random().toString(36).substring(2, 9),
            serviceDetails: `Room Booking For\n${b.clientName}`,
            hsnSac: '998552',
            quantity: 1,
            rate: b.amount || 0,
            discountPercent: 0,
            gstPercent: 12,
          }],
        }));
      }
    }
  }, [isNew, id, invoices, quotationId, bookingId, hotelQuotations, bookings]);

  // Handle auto supply type based on state
  useEffect(() => {
    if (invoice.clientState === 'West Bengal') {
      setInvoice(prev => ({ ...prev, supplyType: 'Intra-State (CGST + SGST)' }));
    } else if (invoice.clientState) {
      setInvoice(prev => ({ ...prev, supplyType: 'Inter-State (IGST)' }));
    }
  }, [invoice.clientState]);

  const handleUpdate = (field: keyof Invoice, value: any) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const handleLineUpdate = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(invoice.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    handleUpdate('items', newItems);
  };

  const addLine = () => {
    handleUpdate('items', [...(invoice.items || []), {
      id: Math.random().toString(36).substring(2, 9),
      hsnSac: '998552',
      quantity: 1,
      rate: 0,
      discountPercent: 0,
      gstPercent: 12,
    }]);
  };

  const removeLine = (index: number) => {
    const newItems = [...(invoice.items || [])];
    newItems.splice(index, 1);
    handleUpdate('items', newItems);
  };

  // Live Math
  const items = invoice.items || [];
  let taxable = 0;
  let totalGst = 0;
  
  const applyGst = invoice.hasGst !== false;

  items.forEach(item => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discountPercent) || 0;
    const gstPercent = applyGst ? (Number(item.gstPercent) || 0) : 0;
    
    const lineBase = qty * rate;
    const lineTaxable = lineBase - (lineBase * (discount / 100));
    const lineGst = lineTaxable * (gstPercent / 100);
    
    taxable += lineTaxable;
    totalGst += lineGst;
  });

  const isIntra = invoice.supplyType?.includes('CGST');
  const cgst = isIntra ? totalGst / 2 : 0;
  const sgst = isIntra ? totalGst / 2 : 0;
  const igst = !isIntra ? totalGst : 0;
  const roundOff = Number(invoice.roundOff) || 0;
  const grandTotal = taxable + totalGst + roundOff;
  const advance = Number(invoice.advanceReceived) || 0;
  const balance = grandTotal - advance;

  const handleSave = async () => {
    const payload: Invoice = {
      ...invoice,
      id: isNew ? `inv-${Date.now()}` : id,
      invoiceNo: invoice.invoiceNo || defaultInvoiceNo,
      clientName: invoice.clientName || 'Unknown Client',
      subtotal: taxable,
      cgst,
      sgst,
      igst,
      gstAmount: totalGst,
      totalAmount: grandTotal,
      paidAmount: advance,
      balanceAmount: balance,
      status: invoice.status as PaymentStatus,
      items: invoice.items as InvoiceItem[]
    } as Invoice;

    if (isNew) {
      await addInvoice(payload);
    } else {
      await updateInvoice(payload);
    }
    window.alert(`GST Invoice created for: ${payload.invoiceNo}`);
    router.push('/billing?tab=invoices');
  };

  return (
    <DashboardLayout>
      <div className="bg-[#effdf5] min-h-[calc(100vh-64px)] -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1400px] mx-auto pb-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/billing')} className="text-gray-500 hover:text-gray-900 transition-colors flex items-center text-sm font-semibold">
              <ArrowLeft className="w-4 h-4 mr-1" /> Billing
            </button>
            <h1 className="text-2xl font-bold text-[#0f172a]">Invoice {invoice.invoiceNo}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <Button onClick={() => { deleteInvoice(id); router.push('/billing'); }} variant="outline" size="sm" className="bg-white rounded-full font-semibold px-4 h-9 shadow-sm border-gray-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
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
            title="GST Invoice"
            documentNo={invoice.invoiceNo}
          >
            <InvoicePdfTemplate 
              invoice={{...invoice, items, totalAmount: grandTotal, status: invoice.status as any}} 
              settings={settings} 
            />
          </PdfPreviewModal>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Form Content */}
          <div className="flex-1 space-y-6">
            
            {/* Invoice Details */}
            <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold text-gray-800">Invoice details</h2>
                <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 shadow-sm">
                  <Checkbox id="hasGstTop" checked={applyGst} onCheckedChange={(c) => handleUpdate('hasGst', !!c)} className="border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-yellow-950" />
                  <Label htmlFor="hasGstTop" className="text-[12px] font-bold text-yellow-900 cursor-pointer">GST Applicable</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Invoice number</Label>
                  <Input value={invoice.invoiceNo || ''} onChange={e => handleUpdate('invoiceNo', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 font-mono text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Status</Label>
                  <Select value={invoice.status} onValueChange={v => handleUpdate('status', v)}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Draft</SelectItem>
                      <SelectItem value="partially-paid">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Invoice date</Label>
                  <Input type="date" value={invoice.date || ''} onChange={e => handleUpdate('date', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Due date</Label>
                  <Input type="date" value={invoice.dueDate || ''} onChange={e => handleUpdate('dueDate', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Payment terms</Label>
                  <Input value={invoice.paymentTerms || ''} onChange={e => handleUpdate('paymentTerms', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
              </div>
            </Card>

            {/* Bill To */}
            <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-5">
              <h2 className="text-[13px] font-bold text-gray-800">Bill to</h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Client name</Label>
                  <Input value={invoice.clientName || ''} onChange={e => handleUpdate('clientName', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Client GSTIN (optional)</Label>
                  <Input value={invoice.clientGstin || ''} onChange={e => handleUpdate('clientGstin', e.target.value)} placeholder="15-char GSTIN" className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px] uppercase font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Client state</Label>
                  <Select value={invoice.clientState} onValueChange={v => handleUpdate('clientState', v)}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Supply type (auto)</Label>
                  <Select value={invoice.supplyType || 'Intra-State (CGST + SGST)'} onValueChange={v => handleUpdate('supplyType', v)}>
                    <SelectTrigger className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Intra-State (CGST + SGST)">Intra-State (CGST + SGST)</SelectItem>
                      <SelectItem value="Inter-State (IGST)">Inter-State (IGST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Billing address</Label>
                  <Textarea value={invoice.billingAddress || ''} onChange={e => handleUpdate('billingAddress', e.target.value)} placeholder="Street, City, State — PIN" className="min-h-[80px] rounded-xl bg-gray-50/50 border-gray-200 text-[14px] resize-none" />
                </div>
              </div>
            </Card>

            {/* Service Lines */}
            <Card className="p-0 border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <h2 className="text-[13px] font-bold text-gray-800">Service lines</h2>
                <Button onClick={addLine} variant="ghost" size="sm" className="h-8 rounded-full text-[12px] font-bold text-[#064e3b] hover:bg-[#effdf5]">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add line
                </Button>
              </div>
              <div className="p-6 space-y-8">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="relative border border-gray-200/60 rounded-xl p-5 bg-gray-50/20">
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                      <span className="font-bold text-[14px] text-gray-900">{formatCurrency((Number(item.rate) * Number(item.quantity)) - ((Number(item.rate) * Number(item.quantity)) * (Number(item.discountPercent)/100)))}</span>
                      {items.length > 1 && (
                        <button onClick={() => removeLine(idx)} className="text-gray-400 hover:text-rose-500 transition-colors">
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Line {idx + 1}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-500">Service date from</Label>
                        <Input type="date" value={item.dateFrom || ''} onChange={e => handleLineUpdate(idx, 'dateFrom', e.target.value)} className="h-9 rounded-lg bg-white border-gray-200 text-[13px]" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-500">Service date to</Label>
                        <Input type="date" value={item.dateTo || ''} onChange={e => handleLineUpdate(idx, 'dateTo', e.target.value)} className="h-9 rounded-lg bg-white border-gray-200 text-[13px]" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-500">Service details (one per line)</Label>
                        <Textarea value={item.serviceDetails || ''} onChange={e => handleLineUpdate(idx, 'serviceDetails', e.target.value)} className="min-h-[80px] rounded-lg bg-white border-gray-200 text-[13px] resize-none leading-relaxed" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3 mt-4">
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-[11px] text-gray-500">HSN/SAC</Label>
                        <Input value={item.hsnSac || ''} onChange={e => handleLineUpdate(idx, 'hsnSac', e.target.value)} className="h-9 rounded-lg bg-white border-gray-200 text-[13px] font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-500">Qty</Label>
                        <Input type="number" value={item.quantity || ''} onChange={e => handleLineUpdate(idx, 'quantity', Number(e.target.value))} className="h-9 rounded-lg bg-white border-gray-200 text-[13px]" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-500">Rate (₹)</Label>
                        <Input type="number" value={item.rate || ''} onChange={e => handleLineUpdate(idx, 'rate', Number(e.target.value))} className="h-9 rounded-lg bg-white border-gray-200 text-[13px]" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-gray-500">Discount %</Label>
                        <Input type="number" value={item.discountPercent || ''} onChange={e => handleLineUpdate(idx, 'discountPercent', Number(e.target.value))} className="h-9 rounded-lg bg-white border-gray-200 text-[13px]" />
                      </div>
                      {applyGst && (
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-gray-500">GST %</Label>
                          <Input type="number" value={item.gstPercent || ''} onChange={e => handleLineUpdate(idx, 'gstPercent', Number(e.target.value))} className="h-9 rounded-lg bg-white border-gray-200 text-[13px]" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Footer & Notes */}
            <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-5">
              <h2 className="text-[13px] font-bold text-gray-800">Footer & notes</h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Disclaimer note</Label>
                  <Input value={invoice.disclaimerNote || ''} onChange={e => handleUpdate('disclaimerNote', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Round off (₹)</Label>
                  <Input type="number" value={invoice.roundOff || ''} onChange={e => handleUpdate('roundOff', Number(e.target.value))} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Advance received (₹)</Label>
                  <Input type="number" value={invoice.advanceReceived || ''} onChange={e => handleUpdate('advanceReceived', Number(e.target.value))} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Place of issue</Label>
                  <Input value={invoice.placeOfIssue || ''} onChange={e => handleUpdate('placeOfIssue', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Signatory name</Label>
                  <Input value={invoice.signatoryName || ''} onChange={e => handleUpdate('signatoryName', e.target.value)} className="h-10 rounded-xl bg-gray-50/50 border-gray-200 text-[14px]" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-[12px] text-gray-500 font-medium">Extra note (optional)</Label>
                  <Textarea value={invoice.extraNote || ''} onChange={e => handleUpdate('extraNote', e.target.value)} className="min-h-[80px] rounded-xl bg-gray-50/50 border-gray-200 text-[14px] resize-none" />
                </div>
              </div>
            </Card>

          </div>

          {/* Right Sidebar - GST Summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-6">
              <Card className="p-6 border-0 shadow-sm rounded-2xl bg-white space-y-4">
                <h2 className="text-[14px] font-bold text-gray-900 pb-2 border-b border-gray-100">{applyGst ? 'GST summary' : 'Summary'}</h2>
                
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-[13px] text-gray-600">
                    <span>{applyGst ? 'Taxable' : 'Amount'}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(taxable)}</span>
                  </div>
                  {applyGst && isIntra && (
                    <>
                      <div className="flex justify-between items-center text-[13px] text-gray-600">
                        <span>CGST</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(cgst)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px] text-gray-600">
                        <span>SGST</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(sgst)}</span>
                      </div>
                    </>
                  )}
                  {applyGst && !isIntra && (
                    <div className="flex justify-between items-center text-[13px] text-gray-600">
                      <span>IGST</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(igst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[13px] text-gray-600">
                    <span>Round off</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(roundOff)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[15px] font-bold text-gray-900">
                    <span>Grand total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <div className="flex justify-between items-center text-[13px] text-gray-500">
                    <span>Advance Received</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(advance)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[14px] font-bold">
                    <span className="text-gray-900">Balance Payable</span>
                    <span className="text-rose-600">{formatCurrency(balance)}</span>
                  </div>
                </div>
                
                <div className="pt-2 text-[10px] text-gray-400 italic">
                  * Amounts are strictly calculated based on the service lines above.
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

export default function InvoiceEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <InvoiceEditorPageInner />
    </Suspense>
  );
}
