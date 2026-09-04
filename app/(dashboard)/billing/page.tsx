'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Search, Plus, FileText, Receipt as ReceiptIcon, Trash2, MessageCircle } from 'lucide-react';

function BillingHubInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { invoices, receipts, hotelQuotations, bookings, deleteReceipt, deleteInvoice } = useHotelStore();
  const tabParam = searchParams.get('tab') as 'quotations' | 'receipts' | 'invoices';
  const [activeTab, setActiveTab] = useState<'quotations' | 'receipts' | 'invoices'>(tabParam || 'quotations');
  const [searchTerm, setSearchTerm] = useState('');

  const handleWhatsApp = (e: React.MouseEvent, docNo: string) => {
    e.stopPropagation();
    const text = encodeURIComponent(`Hello, here is your document: ${docNo}`);
    window.open(`https://wa.me/916292114000?text=${text}`, '_blank');
  };

  const confirmedQuotations = hotelQuotations.filter(q => (q.status || '').toLowerCase() === 'confirmed');
  const confirmedBookings = bookings.filter(b => (b.status || '').toLowerCase() === 'confirmed');

  const filteredQuotations = confirmedQuotations.filter((q) =>
    (q.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (q.quotationNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = confirmedBookings.filter((b) =>
    (b.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.bookingNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReceipts = receipts.filter((r) =>
    (r.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.receiptNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = invoices.filter((i) =>
    (i.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.invoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Billing & GST Invoices</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              {invoices.length} invoices · {receipts.length} receipts · {confirmedQuotations.length + confirmedBookings.length} confirmed packages
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => router.push('/billing/invoice/new')} 
              variant="outline" 
              className="bg-white border-gray-200 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 h-10 rounded-xl px-5"
            >
              <Plus className="mr-2 h-4 w-4" /> Blank invoice
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="bg-transparent border-0 h-auto p-0 gap-6 flex justify-start border-b border-gray-200/60 rounded-none w-full">
            <TabsTrigger 
              value="quotations" 
              className="data-[state=active]:bg-[#effdf5] data-[state=active]:text-[#064e3b] data-[state=active]:border-[#064e3b]/20 data-[state=active]:shadow-none border border-transparent rounded-full px-5 py-2 text-[14px] font-semibold text-gray-500 transition-all"
            >
              Confirmed quotations ({confirmedQuotations.length})
            </TabsTrigger>
            <TabsTrigger 
              value="receipts" 
              className="data-[state=active]:bg-[#effdf5] data-[state=active]:text-[#064e3b] data-[state=active]:border-[#064e3b]/20 data-[state=active]:shadow-none border border-transparent rounded-full px-5 py-2 text-[14px] font-semibold text-gray-500 transition-all"
            >
              Advance Receipts ({receipts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="invoices" 
              className="data-[state=active]:bg-[#effdf5] data-[state=active]:text-[#064e3b] data-[state=active]:border-[#064e3b]/20 data-[state=active]:shadow-none border border-transparent rounded-full px-5 py-2 text-[14px] font-semibold text-gray-500 transition-all"
            >
              GST Invoices ({invoices.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'quotations' && (
          <div className="space-y-8">
            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Confirmed Quotations</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Quotation #</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Guest</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Stay Dates</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Payment</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Amount</TableHead>
                    <TableHead className="text-right font-semibold text-gray-500 text-[13px] h-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((q) => {
                    const qReceipts = receipts.filter(r => r.quotationNo === q.quotationNo || (r.bookingId && r.bookingId === q.id));
                    const totalReceived = qReceipts.reduce((sum, r) => sum + (Number(r.amount) || Number(r.receivedAmount) || 0), 0);
                    const balance = (q.grandTotal || 0) - totalReceived;
                    const isFullyPaid = balance <= 0 && (q.grandTotal || 0) > 0;
                    const isPartiallyPaid = totalReceived > 0 && !isFullyPaid;
                    const existingInvoice = invoices.find(i => i.quotationId === q.id || (q.quotationNo && i.invoiceNo.includes(q.quotationNo)));

                    return (
                    <TableRow key={q.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <TableCell className="font-bold text-[13px] text-gray-700">{q.quotationNo}</TableCell>
                      <TableCell>
                        <div className="font-medium text-[13px] text-gray-800">{q.guestName}</div>
                        <div className="text-[12px] text-gray-400">{q.guestMobile}</div>
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                         {q.checkIn ? formatDate(q.checkIn) : '-'} to {q.checkOut ? formatDate(q.checkOut) : '-'}
                      </TableCell>
                      <TableCell>
                        {isFullyPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Paid
                          </span>
                        ) : isPartiallyPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Partially Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Payment Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-[13px] text-gray-900">{formatCurrency(q.grandTotal)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isFullyPaid ? (
                            <Button 
                              onClick={() => {
                                const latestReceipt = qReceipts[qReceipts.length - 1];
                                if (latestReceipt) router.push(`/billing/receipt/${latestReceipt.id}`);
                              }}
                              variant="outline" size="sm" className="h-8 rounded-full text-[12px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                            >
                              <ReceiptIcon className="w-3.5 h-3.5 mr-1.5" /> Full Receipt
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => router.push(`/billing/receipt/new?quotationId=${q.id}`)}
                              variant="outline" size="sm" className="h-8 rounded-full text-[12px] font-semibold text-[#064e3b] bg-[#effdf5] border-[#064e3b]/20 hover:bg-[#dcfce7]"
                            >
                              <ReceiptIcon className="w-3.5 h-3.5 mr-1.5" /> {isPartiallyPaid ? 'Add Receipt' : 'Advance Receipt'}
                            </Button>
                          )}
                          {existingInvoice ? (
                            <Button 
                              onClick={() => router.push(`/billing/invoice/${existingInvoice.id}`)}
                              size="sm" 
                              className="h-8 rounded-full text-[12px] font-bold text-white bg-gray-800 hover:bg-gray-900 border-0 shadow-none"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1.5" /> View Invoice
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => router.push(`/billing/invoice/new?quotationId=${q.id}`)}
                              size="sm" 
                              className="h-8 rounded-full text-[12px] font-bold text-yellow-950 bg-yellow-400 hover:bg-yellow-500 border-0 shadow-none"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1.5" /> GST Invoice
                            </Button>
                          )}
                          <Button 
                            onClick={(e) => handleWhatsApp(e, q.quotationNo)}
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-0 shadow-none flex-shrink-0"
                            title="Send via WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>

            <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Confirmed Bookings</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Client</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Dates</TableHead>
                    <TableHead className="font-semibold text-gray-500 text-[13px] h-12">Amount</TableHead>
                    <TableHead className="text-right font-semibold text-gray-500 text-[13px] h-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((b) => (
                    <TableRow key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <TableCell className="font-bold text-[13px] text-gray-800">{b.clientName}</TableCell>
                      <TableCell className="text-[13px] text-gray-600">
                        {b.checkIn ? formatDate(b.checkIn) : '-'} {b.checkOut ? `- ${formatDate(b.checkOut)}` : ''}
                      </TableCell>
                      <TableCell className="font-bold text-[13px] text-gray-900">{formatCurrency(b.amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          onClick={() => router.push(`/billing/invoice/new?bookingId=${b.id}`)}
                          size="sm" 
                          className="h-8 rounded-full text-[12px] font-bold text-yellow-950 bg-yellow-400 hover:bg-yellow-500 border-0 shadow-none"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" /> Generate invoice
                        </Button>
                        <Button 
                          onClick={(e) => handleWhatsApp(e, b.bookingNo || 'Booking')}
                          size="sm" 
                          className="h-8 w-8 ml-2 p-0 rounded-full text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-0 shadow-none flex-shrink-0"
                          title="Send via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeTab === 'receipts' && (
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 rounded-xl border-gray-200 bg-gray-50/50 text-[13px]"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-[#effdf5] hover:bg-[#effdf5] border-b-0">
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11 rounded-tl-xl">Receipt #</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Customer</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Quotation</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Date</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Mode</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Received</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Balance</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11 rounded-tr-xl text-center w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-400 text-sm">
                      No receipts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map((r) => {
                    const received = Number(r.amount) || Number(r.receivedAmount) || 0;
                    const balance = (Number(r.grandTotal) || 0) - received;
                    return (
                    <TableRow key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => router.push(`/billing/receipt/${r.id}`)}>
                      <TableCell className="font-bold text-[13px] text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <ReceiptIcon className="w-3.5 h-3.5 text-gray-400" /> {r.receiptNo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[13px] text-gray-800">{r.clientName}</div>
                        {r.clientMobile && <div className="text-[12px] text-gray-400">{r.clientMobile}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="text-[12px] text-gray-500 font-medium">{r.quotationNo || r.referenceNo || '-'}</div>
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">{r.date ? formatDate(r.date.split('T')[0]) : '-'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase border border-gray-200">
                          {r.paymentMethod || r.method || 'UPI'}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-[13px] text-emerald-600">{formatCurrency(received)}</TableCell>
                      <TableCell className="font-bold text-[13px] text-rose-600">
                        {formatCurrency(balance > 0 ? balance : 0)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 rounded-full"
                            title="Send via WhatsApp"
                            onClick={(e) => handleWhatsApp(e, r.receiptNo)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this receipt?")) {
                              deleteReceipt(r.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeTab === 'invoices' && (
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 rounded-xl border-gray-200 bg-gray-50/50 text-[13px]"
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-[#effdf5] hover:bg-[#effdf5] border-b-0">
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11 rounded-tl-xl">Invoice #</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Client</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Date</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Supply</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Payment</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Total</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11">Balance</TableHead>
                  <TableHead className="font-semibold text-gray-600 text-[13px] h-11 rounded-tr-xl text-center w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-400 text-sm">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => router.push(`/billing/invoice/${inv.id}`)}>
                      <TableCell className="font-bold text-[13px] text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-gray-400" /> {inv.invoiceNo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[13px] text-gray-800">{inv.clientName}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{inv.clientState || 'West Bengal'}</div>
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-600">{inv.issueDate ? formatDate(inv.issueDate.split('T')[0]) : '-'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-50 text-gray-600 uppercase border border-gray-200">
                          {inv.supplyType || 'CGST+SGST'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="font-bold text-[13px] text-gray-900">{formatCurrency(inv.totalAmount)}</TableCell>
                      <TableCell className="font-bold text-[13px] text-gray-900">{formatCurrency(inv.balanceAmount)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 rounded-full"
                            title="Send via WhatsApp"
                            onClick={(e) => handleWhatsApp(e, inv.invoiceNo)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this invoice?")) {
                              deleteInvoice(inv.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default function BillingHubContent() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <BillingHubInner />
    </Suspense>
  );
}
