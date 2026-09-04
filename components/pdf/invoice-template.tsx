import React from 'react';
import { Invoice, CompanySettings } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface InvoicePdfTemplateProps {
  invoice: any;
  settings: CompanySettings | null;
}

export const InvoicePdfTemplate: React.FC<InvoicePdfTemplateProps> = ({ invoice, settings }) => {
  const isIntra = invoice.supplyType?.includes('Intra-State');
  const applyGst = invoice.hasGst !== false;
  
  const taxableAmount = invoice.items?.reduce((sum: number, item: any) => {
    const raw = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const disc = raw * ((Number(item.discountPercent) || 0) / 100);
    return sum + (raw - disc);
  }, 0) || 0;

  const totalGst = invoice.items?.reduce((sum: number, item: any) => {
    const raw = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const disc = raw * ((Number(item.discountPercent) || 0) / 100);
    const itemTax = (raw - disc) * (applyGst ? ((Number(item.gstPercent) || 0) / 100) : 0);
    return sum + itemTax;
  }, 0) || 0;

  const cgst = isIntra ? totalGst / 2 : 0;
  const sgst = isIntra ? totalGst / 2 : 0;
  const igst = isIntra ? 0 : totalGst;

  const roundOff = invoice.roundOff || 0;
  const grandTotal = taxableAmount + totalGst + roundOff;

  return (
    <div className="relative text-[12px] font-sans text-black">
      {/* Watermark */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.05] overflow-hidden">
        <img src={settings?.logoUrl || '/logo.png'} alt="Watermark" className="w-[60%] max-w-[500px] object-contain grayscale" />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Header */}
      {/* Header */}
      <div className="grid grid-cols-3 items-start border-b-2 border-primary pb-6 gap-4">
        {/* Left: Logo */}
        <div className="flex-1">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Company Logo" className="h-28 w-auto max-w-[240px] object-contain mix-blend-multiply" />
          ) : (
            <img src="/logo.png" alt="Company Logo" className="h-28 w-auto max-w-[240px] object-contain mix-blend-multiply" />
          )}
        </div>

        {/* Middle: Document Title */}
        <div className="flex flex-col items-center justify-center text-center mt-2">
          <div className="text-xl font-extrabold text-primary uppercase tracking-wider">{applyGst ? 'TAX INVOICE' : 'INVOICE'}</div>
          <div className="text-sm font-mono font-bold mt-2">Invoice No: {invoice.invoiceNo}</div>
          <div className="text-xs text-slate-500 mt-0.5">Date: {formatDate(invoice.date || new Date().toISOString())}</div>
          {invoice.dueDate && <div className="text-xs text-slate-500 mt-0.5">Due Date: {formatDate(invoice.dueDate)}</div>}
        </div>

        {/* Right: Company Details */}
        <div className="flex flex-col items-end text-right">
          <h2 className="text-lg font-extrabold tracking-tight uppercase text-primary">
            {settings?.companyName || 'Gajagamini Forest Resort'}
          </h2>
          <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] leading-snug">
            {settings?.address || 'Lataguri, Bichabhanga Village, Opposite 1 No. Range Office, West Bengal, 735219'}
          </p>
          <div className="mt-2 text-[10px] font-mono space-y-0.5 text-slate-500">
            <div>Phone: {settings?.phone || '+91 98300 12345'}</div>
            <div>Email: {settings?.email || 'contact@gajagamini.com'}</div>
            <div className="font-semibold text-slate-700">GSTIN: {settings?.gstin || '19AAYPI5879F3ZR'}</div>
          </div>
        </div>
      </div>

      {/* Bill To & Details */}
      <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded border border-slate-200">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">Billed To</div>
          <div className="font-bold text-base text-slate-900">{invoice.clientName}</div>
          {invoice.billingAddress && (
            <div className="text-xs mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">
              {invoice.billingAddress}
            </div>
          )}
          {invoice.clientState && <div className="text-xs mt-1">State: {invoice.clientState}</div>}
          {invoice.clientGstin && <div className="text-xs font-mono mt-1 font-semibold text-slate-800">GSTIN: {invoice.clientGstin}</div>}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 border-b border-slate-200 pb-1">Invoice Details</div>
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="py-1 text-slate-600">Supply Type:</td>
                <td className="py-1 font-semibold text-right">{invoice.supplyType}</td>
              </tr>
              {invoice.paymentTerms && (
                <tr>
                  <td className="py-1 text-slate-600">Payment Terms:</td>
                  <td className="py-1 font-semibold text-right">{invoice.paymentTerms}</td>
                </tr>
              )}
              {invoice.travellers && (
                <tr>
                  <td className="py-1 text-slate-600">Travellers:</td>
                  <td className="py-1 font-semibold text-right">{invoice.travellers}</td>
                </tr>
              )}
              {invoice.placeOfIssue && (
                <tr>
                  <td className="py-1 text-slate-600">Place of Supply:</td>
                  <td className="py-1 font-semibold text-right">{invoice.placeOfIssue}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Lines Table */}
      <div>
        <table className="w-full text-xs border border-slate-300">
          <thead className="bg-slate-100 font-bold text-left text-slate-800">
            <tr>
              <th className="p-3 border-r border-b border-slate-300 w-8 text-center">#</th>
              <th className="p-3 border-r border-b border-slate-300">Service Description</th>
              <th className="p-3 border-r border-b border-slate-300 text-center">HSN/SAC</th>
              <th className="p-3 border-r border-b border-slate-300 text-right">Qty</th>
              <th className="p-3 border-r border-b border-slate-300 text-right">Rate</th>
              <th className="p-3 border-r border-b border-slate-300 text-right">Disc. %</th>
              <th className="p-3 border-r border-b border-slate-300 text-right">{applyGst ? 'Taxable' : 'Amount'}</th>
              {applyGst && <th className="p-3 border-r border-b border-slate-300 text-right">GST %</th>}
              <th className="p-3 border-b border-slate-300 text-right font-bold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items?.map((item: any, idx: number) => {
              const raw = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
              const disc = raw * ((Number(item.discountPercent) || 0) / 100);
              const tax = raw - disc;
              const gstAmt = tax * (applyGst ? ((Number(item.gstPercent) || 0) / 100) : 0);
              const total = tax + gstAmt;

              return (
                <tr key={idx} className="group hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                  <td className="p-3 border-r border-slate-300">
                    <div className="font-semibold text-slate-900 whitespace-pre-wrap">{item.serviceDetails}</div>
                    {item.vehicles && (
                      <div className="text-[10px] text-slate-500 mt-1 whitespace-pre-wrap">Vehicles: {item.vehicles}</div>
                    )}
                    {(item.dateFrom || item.dateTo) && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Dates: {item.dateFrom ? formatDate(item.dateFrom) : ''} to {item.dateTo ? formatDate(item.dateTo) : ''}
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-r border-slate-300 text-center font-mono text-slate-700">{item.hsnSac || '-'}</td>
                  <td className="p-3 border-r border-slate-300 text-right">{item.quantity}</td>
                  <td className="p-3 border-r border-slate-300 text-right">{formatCurrency(Number(item.rate))}</td>
                  <td className="p-3 border-r border-slate-300 text-right">{item.discountPercent ? `${item.discountPercent}%` : '-'}</td>
                  <td className="p-3 border-r border-slate-300 text-right font-mono">{formatCurrency(tax)}</td>
                  {applyGst && <td className="p-3 border-r border-slate-300 text-right text-slate-600">{item.gstPercent ? `${item.gstPercent}%` : 'EXEMPT'}</td>}
                  <td className="p-3 text-right font-bold font-mono">{formatCurrency(total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-between items-start pt-4">
        <div className="w-1/2 pr-8">
          {invoice.bankDetails && (
            <div className="text-[10px] text-slate-500 border border-slate-200 p-4 rounded bg-slate-50">
              <span className="font-bold uppercase tracking-wider block mb-2 text-slate-700">Bank Details</span>
              <div className="whitespace-pre-wrap leading-relaxed">
                {invoice.bankDetails}
              </div>
            </div>
          )}
          {invoice.extraNote && (
            <div className="mt-4 text-xs text-slate-700 bg-amber-50 p-3 rounded border border-amber-200">
              <span className="font-bold text-amber-900 block mb-1">Note:</span>
              <div className="whitespace-pre-wrap">{invoice.extraNote}</div>
            </div>
          )}
        </div>

        <div className="w-[45%]">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 text-slate-600 font-semibold">{applyGst ? 'Total Taxable Value' : 'Subtotal'}</td>
                <td className="py-2 text-right font-mono font-bold text-slate-900">{formatCurrency(taxableAmount)}</td>
              </tr>
              {applyGst && isIntra && (
                <>
                  <tr>
                    <td className="py-2 text-slate-600">CGST</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(cgst)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-600">SGST</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(sgst)}</td>
                  </tr>
                </>
              )}
              {applyGst && !isIntra && (
                <tr>
                  <td className="py-2 text-slate-600">IGST</td>
                  <td className="py-2 text-right font-mono">{formatCurrency(igst)}</td>
                </tr>
              )}
              {roundOff !== 0 && (
                <tr>
                  <td className="py-2 text-slate-600">Round Off</td>
                  <td className="py-2 text-right font-mono">{formatCurrency(roundOff)}</td>
                </tr>
              )}
              <tr className="bg-slate-100">
                <td className="py-3 px-2 font-extrabold text-sm text-primary uppercase">Grand Total</td>
                <td className="py-3 px-2 text-right font-extrabold font-mono text-sm text-primary">{formatCurrency(grandTotal)}</td>
              </tr>
              {(invoice.advanceReceived || 0) > 0 && (
                <tr>
                  <td className="py-2 px-2 text-emerald-700 font-semibold">Advance Received</td>
                  <td className="py-2 px-2 text-right font-mono text-emerald-700 font-semibold">-{formatCurrency(invoice.advanceReceived || 0)}</td>
                </tr>
              )}
              <tr className="bg-slate-800 text-white">
                <td className="py-3 px-3 font-bold uppercase text-[11px] tracking-wider">Balance Due</td>
                <td className="py-3 px-3 text-right font-extrabold font-mono text-sm">{formatCurrency(grandTotal - (invoice.advanceReceived || 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer & Signatures */}
      <div className="pt-24 flex justify-between items-end border-t-2 border-slate-100 mt-8 break-inside-avoid">
        <div className="text-[10px] text-slate-500 w-1/2 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
          <strong className="text-slate-800 uppercase tracking-wider text-[11px] mb-1 block">Terms & Conditions:</strong>
          {invoice.disclaimerNote || '1. All payments must be made in full before the due date.\n2. Any disputes are subject to the local jurisdiction.\n3. This is a computer-generated invoice and does not require a physical signature.'}
        </div>
        <div className="text-center w-64 flex flex-col items-center">
          <div className="mb-2 flex flex-col justify-end items-center min-h-[80px]">
            {/* Stamp/Signature Space */}
            <img src="/stamp.png" alt="Stamp and Signature" className="h-20 w-auto object-contain mix-blend-multiply" />
          </div>
          <div className="font-extrabold text-slate-800 uppercase text-[11px]">
            For {settings?.companyName || 'Gajagamini Forest Resort'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {invoice.signatoryName || settings?.adminFullName || 'Authorized Signatory'}
          </div>
        </div>
      </div>
      
      {settings?.footerLogoUrl && (
        <div className="mt-8 flex justify-center break-inside-avoid">
          <img src={settings.footerLogoUrl} alt="Footer Details" className="h-28 w-auto object-contain max-w-full mix-blend-multiply" />
        </div>
      )}
      </div>
    </div>
  );
};
