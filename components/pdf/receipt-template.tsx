import React from 'react';
import { Receipt, CompanySettings } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ReceiptPdfTemplateProps {
  receipt: any;
  settings: CompanySettings | null;
}

export const ReceiptPdfTemplate: React.FC<ReceiptPdfTemplateProps> = ({ receipt, settings }) => {
  return (
    <div className="relative text-[13px] font-sans text-black">
      {/* Watermark */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.05] overflow-hidden">
        <img src={settings?.logoUrl || '/logo.png'} alt="Watermark" className="w-[60%] max-w-[500px] object-contain grayscale" />
      </div>

      <div className="relative z-10 space-y-8">
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
          <div className="text-xl font-extrabold text-primary uppercase tracking-wider">OFFICIAL RECEIPT</div>
          <div className="text-sm font-mono font-bold mt-2 text-slate-800">Receipt No: {receipt.receiptNo}</div>
          <div className="text-xs text-slate-500 mt-0.5">Date: {formatDate(receipt.date || new Date().toISOString())}</div>
        </div>

        {/* Right: Company Details */}
        <div className="flex flex-col items-end text-right">
          <h2 className="text-lg font-extrabold tracking-tight uppercase text-primary">
            {settings?.companyName || 'Gajagamini Forest Resort'}
          </h2>
          <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] leading-snug">
            {settings?.address || 'MG Marg, Gangtok, Sikkim — 737101'}
          </p>
          <div className="mt-2 text-[10px] font-mono space-y-0.5 text-slate-500">
            <div>Phone: {settings?.phone || '+91 98300 12345'}</div>
            <div>Email: {settings?.email || 'contact@gajagamini.com'}</div>
            {settings?.gstin && <div>GSTIN: {settings?.gstin}</div>}
            <div className="font-semibold text-slate-700">Registration No. 19AAYPI5879F3ZR</div>
          </div>
        </div>
      </div>

      <div className="text-center font-bold text-lg border-y-2 border-dashed border-slate-200 py-3 text-slate-700 uppercase tracking-widest">
        {((Number(receipt.grandTotal) || 0) - (Number(receipt.amount) || Number(receipt.receivedAmount) || 0)) <= 0 ? 'Full Payment Receipt' : 'Advance Payment Receipt'}
      </div>

      {/* Main Body */}
      <div className="space-y-6 leading-loose pt-4 px-4 text-[15px] text-slate-800">
        <div className="flex flex-col gap-8">
          <div className="flex items-end gap-2 border-b border-dotted border-slate-400 pb-1">
            <span className="font-bold shrink-0 text-slate-600">Received with thanks from Mr./Ms./M/s:</span>
            <span className="font-bold flex-1 text-slate-900 pl-4 font-mono">{receipt.clientName}</span>
          </div>

          <div className="flex items-end gap-2 border-b border-dotted border-slate-400 pb-1">
            <span className="font-bold shrink-0 text-slate-600">The sum of Rupees (in words):</span>
            <span className="italic flex-1 text-slate-800 pl-4 font-mono">
              {/* Note: A number-to-words helper would be better here, but we just print the number for now if unavailable */}
              {formatCurrency(receipt.amount)} only
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-end gap-2 border-b border-dotted border-slate-400 pb-1">
              <span className="font-bold shrink-0 text-slate-600">By Cash / Cheque / DD / UPI:</span>
              <span className="font-bold flex-1 text-slate-900 pl-4 font-mono">{receipt.paymentMethod || 'Online'}</span>
            </div>
            <div className="flex items-end gap-2 border-b border-dotted border-slate-400 pb-1">
              <span className="font-bold shrink-0 text-slate-600">Reference / Txn ID:</span>
              <span className="font-bold flex-1 text-slate-900 pl-4 font-mono">{receipt.referenceNo || 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-end gap-2 border-b border-dotted border-slate-400 pb-1">
              <span className="font-bold shrink-0 text-slate-600">Drawn on (Bank):</span>
              <span className="font-bold flex-1 text-slate-900 pl-4 font-mono">{receipt.paymentMethod === 'Bank Transfer' ? 'Direct Bank Transfer' : 'N/A'}</span>
            </div>
            <div className="flex items-end gap-2 border-b border-dotted border-slate-400 pb-1">
              <span className="font-bold shrink-0 text-slate-600">Against Booking/Invoice:</span>
              <span className="font-bold flex-1 text-slate-900 pl-4 font-mono">{receipt.invoiceId || receipt.bookingId || 'Advance Payment'}</span>
            </div>
          </div>
          
          {receipt.notes && (
            <div className="flex items-end gap-2 border-b border-dotted border-slate-400 pb-1">
              <span className="font-bold shrink-0 text-slate-600">Remarks:</span>
              <span className="font-bold flex-1 text-slate-900 pl-4">{receipt.notes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end pt-24 px-4 mt-8 break-inside-avoid">
        <div className="w-1/2">
          <div className="flex gap-4">
            <div className="border-2 border-slate-800 rounded bg-slate-50 py-3 px-8 text-2xl font-mono font-extrabold text-slate-900">
              {formatCurrency(receipt.amount)}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-6 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
            * Subject to realization of Cheque / DD / Online Transfer.<br />
            * This is a computer-generated receipt.
          </div>
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
            Authorized Signatory
          </div>
        </div>
      </div>
      
      {settings?.footerLogoUrl && (
        <div className="mt-8 flex justify-center break-inside-avoid border-t-2 border-slate-100 pt-8">
          <img src={settings.footerLogoUrl} alt="Footer Details" className="h-28 w-auto object-contain max-w-full mix-blend-multiply" />
        </div>
      )}
      </div>
    </div>
  );
};
