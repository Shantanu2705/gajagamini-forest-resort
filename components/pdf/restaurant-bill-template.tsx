import React from 'react';
import { RestaurantBill, CompanySettings } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface RestaurantBillPdfTemplateProps {
  bill: RestaurantBill;
  settings: CompanySettings | null;
}

export const RestaurantBillPdfTemplate: React.FC<RestaurantBillPdfTemplateProps> = ({ bill, settings }) => {
  return (
    <div className="relative text-[12px] font-sans text-black bg-white">
      {/* Watermark */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.05] overflow-hidden">
        <img src={settings?.logoUrl || '/logo.png'} alt="Watermark" className="w-[60%] max-w-[500px] object-contain grayscale" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="grid grid-cols-3 items-start border-b-2 border-primary pb-6 gap-4">
          {/* Left: Logo */}
          <div className="flex-1">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Company Logo" className="h-24 w-auto max-w-[240px] object-contain mix-blend-multiply" />
            ) : (
              <img src="/logo.png" alt="Company Logo" className="h-24 w-auto max-w-[240px] object-contain mix-blend-multiply" />
            )}
          </div>

          {/* Middle: Document Title */}
          <div className="flex flex-col items-center justify-center text-center mt-2">
            <div className="text-xl font-extrabold text-primary uppercase tracking-wider">RESTAURANT BILL</div>
            <div className="text-sm font-mono font-bold mt-2">Bill No: {bill.billNo}</div>
            <div className="text-xs text-slate-500 mt-0.5">Date: {formatDate(bill.date)}</div>
          </div>

          {/* Right: Company Details */}
          <div className="flex flex-col items-end text-right">
            <h2 className="text-lg font-extrabold tracking-tight uppercase text-primary">
              {settings?.companyName || 'Gajagamini Forest Resort'}
            </h2>
            <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] leading-snug">
              {settings?.address || 'Opposit Bichabhanga Range Office, NH 31, Lataguri, WB'}
            </p>
            <div className="mt-2 text-[10px] font-mono space-y-0.5 text-slate-500">
              <div>Phone: {settings?.phone || '+91 9830712000'}</div>
              <div>Email: {settings?.email || 'gajagaminilataguri@gmail.com'}</div>
              {settings?.gstin && <div>GSTIN: {settings?.gstin}</div>}
              <div className="font-semibold text-slate-700">Registration No. 19AAYPI5879F3ZR</div>
            </div>
          </div>
        </div>

        {/* Bill Details */}
        <div className="flex justify-between items-start bg-slate-50 p-4 rounded border border-slate-200">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Guest Details</div>
            {bill.guestName ? (
              <div className="font-bold text-base text-slate-900">{bill.guestName}</div>
            ) : (
              <div className="font-bold text-base text-slate-900 italic">Walk-in Guest</div>
            )}
            {bill.mobile && <div className="text-xs">Mobile: {bill.mobile}</div>}
          </div>
          <div className="space-y-1 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Order Details</div>
            {bill.tableNo && <div className="font-semibold text-sm">Table No: {bill.tableNo}</div>}
            {bill.roomNo && <div className="font-semibold text-sm">Room No: {bill.roomNo}</div>}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold text-left text-slate-800">
              <tr>
                <th className="p-3 border-r border-b border-slate-300 w-8 text-center">#</th>
                <th className="p-3 border-r border-b border-slate-300">Item Description</th>
                <th className="p-3 border-r border-b border-slate-300 text-center">Category</th>
                <th className="p-3 border-r border-b border-slate-300 text-right">Qty</th>
                <th className="p-3 border-r border-b border-slate-300 text-right">Rate</th>
                <th className="p-3 border-b border-slate-300 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bill.items.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-300 text-center text-slate-500">{idx + 1}</td>
                  <td className="p-3 border-r border-slate-300 font-semibold text-slate-900">{item.name}</td>
                  <td className="p-3 border-r border-slate-300 text-center text-slate-600">{item.category || '-'}</td>
                  <td className="p-3 border-r border-slate-300 text-right">{item.quantity}</td>
                  <td className="p-3 border-r border-slate-300 text-right">{formatCurrency(item.rate)}</td>
                  <td className="p-3 text-right font-bold font-mono">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end pt-4">
          <div className="w-[45%]">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 text-slate-600 font-semibold">Subtotal</td>
                  <td className="py-2 text-right font-mono font-bold text-slate-900">{formatCurrency(bill.subtotal)}</td>
                </tr>
                {bill.discountAmount && bill.discountAmount > 0 ? (
                  <tr>
                    <td className="py-2 text-red-600">Discount ({bill.discountPercent}%)</td>
                    <td className="py-2 text-right font-mono text-red-600">- {formatCurrency(bill.discountAmount)}</td>
                  </tr>
                ) : null}
                {bill.gstAmount > 0 && (
                  <tr>
                    <td className="py-2 text-slate-600">GST ({bill.gstPercent}%)</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(bill.gstAmount)}</td>
                  </tr>
                )}
                {bill.roundOff && bill.roundOff !== 0 ? (
                  <tr>
                    <td className="py-2 text-slate-600">Round Off</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(bill.roundOff)}</td>
                  </tr>
                ) : null}
                <tr className="bg-slate-100">
                  <td className="py-3 px-2 font-extrabold text-sm text-primary uppercase">Grand Total</td>
                  <td className="py-3 px-2 text-right font-extrabold font-mono text-sm text-primary">{formatCurrency(bill.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 text-right text-[10px] text-slate-500 font-medium italic">
              Payment Method: {bill.paymentMethod || 'Cash'}
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="pt-16 flex justify-between items-end border-t-2 border-slate-100 mt-8 break-inside-avoid">
          <div className="text-[10px] text-slate-500 w-1/2 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            <strong className="text-slate-800 uppercase tracking-wider text-[11px] mb-1 block">Thank you for dining with us!</strong>
            Please review your bill. FSSAI License Number (if any) is available upon request. We hope to see you again soon.
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
      </div>
    </div>
  );
};
