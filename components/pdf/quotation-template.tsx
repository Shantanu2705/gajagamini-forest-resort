import React from 'react';
import { CompanySettings, HotelQuotation, HotelQuotationRoomItem, HotelQuotationFoodItem, HotelQuotationServiceItem } from '@/types';
import { formatDate } from '@/utils/formatters';

interface QuotationPdfTemplateProps {
  quotation: HotelQuotation;
  settings: CompanySettings | null;
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const numStr = Math.floor(num).toString();
  if (numStr.length > 9) return numStr; 

  const n = ('000000000' + numStr).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return numStr;

  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0] as any] + ' ' + a[n[1][1] as any]) + 'Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0] as any] + ' ' + a[n[2][1] as any]) + 'Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0] as any] + ' ' + a[n[3][1] as any]) + 'Thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0] as any] + ' ' + a[n[4][1] as any]) + 'Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0] as any] + ' ' + a[n[5][1] as any]) : '';
  
  return str.trim();
}

export const QuotationPdfTemplate: React.FC<QuotationPdfTemplateProps> = ({ quotation, settings }) => {
  const companyName = settings?.companyName || 'Gajagamini Forest Resort';
  const companyAddress = settings?.address || 'Opposit Bichabhanga Range Office, Near Gorumara National Park Lataguri, Nimna Tandu Forest, West Bengal - 735219';
  const companyContact = settings?.phone || '+91 9830712000 / +91 6292114000';
  const companyEmail = settings?.email === 'contact@gajagamini.com' ? 'gajagaminilataguri@gmail.com' : (settings?.email || 'gajagaminilataguri@gmail.com');
  const gstin = settings?.gstin || '19AAYPI5879F3ZR';
  const website = settings?.website || 'www.gajagaminiresort.com';

  return (
    <div className="relative text-[14px] leading-relaxed text-gray-900 font-sans break-words bg-white">
      {/* Watermark */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.05] overflow-hidden">
        <img src={settings?.logoUrl || '/logo.png'} alt="Watermark" className="w-[60%] max-w-[500px] object-contain grayscale" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-6">
        {/* Left: Logo */}
        <div className="flex-1">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Company Logo" className="h-24 w-auto object-contain mix-blend-multiply" />
          ) : (
            <img src="/logo.png" alt="Company Logo" className="h-24 w-auto object-contain mix-blend-multiply" />
          )}
        </div>
        
        <div className="text-right">
          <h2 className="text-2xl font-bold text-primary m-0 uppercase tracking-wider">{companyName}</h2>
          <div className="text-sm mt-1">{companyAddress}</div>
          <div className="text-sm">Phone: {companyContact} | Email: {companyEmail}</div>
          <div className="text-sm">Web: {website}</div>
          <div className="text-sm font-semibold">GSTIN: {gstin || '19AAYPI5879F3ZR'}</div>
        </div>
      </div>

      <div className="text-center bg-gray-100 py-2 border-y border-gray-300 mb-6">
        <h3 className="text-lg font-bold uppercase tracking-widest text-primary m-0">Quotation</h3>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div className="space-y-1">
          <div className="font-bold text-primary border-b pb-1 mb-2">Guest Details</div>
          <div><span className="font-semibold">Name:</span> {quotation.guestName}</div>
          <div><span className="font-semibold">Mobile:</span> {quotation.guestMobile}</div>
          {quotation.guestEmail && <div><span className="font-semibold">Email:</span> {quotation.guestEmail}</div>}
          {quotation.companyName && <div><span className="font-semibold">Company:</span> {quotation.companyName}</div>}
        </div>
        <div className="space-y-1">
          <div className="font-bold text-primary border-b pb-1 mb-2">Reservation Details</div>
          <div><span className="font-semibold">Quotation No:</span> {quotation.quotationNo}</div>
          <div><span className="font-semibold">Date:</span> {formatDate(quotation.createdAt)}</div>
          <div><span className="font-semibold">Check In:</span> {formatDate(quotation.checkIn)}</div>
          <div><span className="font-semibold">Check Out:</span> {formatDate(quotation.checkOut)}</div>
          <div>
            <span className="font-semibold">Guests:</span> {quotation.adults} Adults, {quotation.children} Children
            {quotation.infants ? `, ${quotation.infants} Infants` : ''} 
            ({quotation.nights} Nights)
          </div>
        </div>
      </div>

      {/* Intro Text */}
      <div className="text-justify mb-6">
        Dear <strong>{quotation.guestName}</strong>,<br/>
        Greetings from Gajagamini Forest Resort! Thank you for choosing us for your upcoming stay. 
        Please find below the detailed quotation for your requirements.
      </div>

      {/* Rooms Table */}
      {quotation.rooms && quotation.rooms.length > 0 && (
        <div className="mb-6">
          <div className="font-bold text-primary mb-2 text-base">Accommodation</div>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Room Type</th>
                <th className="border border-gray-300 p-2 text-center">Rooms</th>
                <th className="border border-gray-300 p-2 text-center">Nights</th>
                <th className="border border-gray-300 p-2 text-right">Rate/Night</th>
                <th className="border border-gray-300 p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quotation.rooms.map((room, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2">{room.roomName}</td>
                  <td className="border border-gray-300 p-2 text-center">{room.numberOfRooms}</td>
                  <td className="border border-gray-300 p-2 text-center">{room.nights}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{room.ratePerNight.toLocaleString()}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{room.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Food Table */}
      {quotation.food && quotation.food.length > 0 && (
        <div className="mb-6">
          <div className="font-bold text-primary mb-2 text-base">Meal Plans</div>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Plan Name</th>
                <th className="border border-gray-300 p-2 text-center">Adults</th>
                <th className="border border-gray-300 p-2 text-center">Children</th>
                <th className="border border-gray-300 p-2 text-center">Days</th>
                <th className="border border-gray-300 p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quotation.food.map((f, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2">{f.mealPlanName}</td>
                  <td className="border border-gray-300 p-2 text-center">{f.adults} @ ₹{f.adultRate}</td>
                  <td className="border border-gray-300 p-2 text-center">{f.children} @ ₹{f.childRate}</td>
                  <td className="border border-gray-300 p-2 text-center">{f.days}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{f.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Services Table */}
      {quotation.services && quotation.services.length > 0 && (
        <div className="mb-6">
          <div className="font-bold text-primary mb-2 text-base">Additional Services</div>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Service</th>
                <th className="border border-gray-300 p-2 text-center">Qty</th>
                <th className="border border-gray-300 p-2 text-right">Unit Price</th>
                <th className="border border-gray-300 p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {quotation.services.map((s, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-2">{s.serviceName}</td>
                  <td className="border border-gray-300 p-2 text-center">{s.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{s.unitPrice.toLocaleString()}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{s.subtotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pricing Summary */}
      <div className="flex justify-end mb-8 mt-6">
        <div className="w-1/2">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="p-2 font-semibold">Subtotal</td>
                <td className="p-2 text-right">₹{quotation.totalSubtotal.toLocaleString()}</td>
              </tr>
              {quotation.discountAmount > 0 && (
                <tr className="text-red-600">
                  <td className="p-2 font-semibold">Discount</td>
                  <td className="p-2 text-right">- ₹{quotation.discountAmount.toLocaleString()}</td>
                </tr>
              )}
              {quotation.gstAmount > 0 && (
                <tr>
                  <td className="p-2 font-semibold">GST ({quotation.gstPercent}%)</td>
                  <td className="p-2 text-right">+ ₹{quotation.gstAmount.toLocaleString()}</td>
                </tr>
              )}
              <tr className="text-base border-t-2 border-gray-400 bg-gray-50">
                <td className="p-2 font-bold text-primary">Grand Total</td>
                <td className="p-2 text-right font-bold text-primary">₹{quotation.grandTotal.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-2 text-right text-xs italic text-gray-500">
            (Amount in words: Rupees {numberToWords(quotation.grandTotal)} Only)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-primary/5 p-4 rounded-md border border-primary/20">
          <div className="font-bold text-primary mb-2">Payment Terms</div>
          <div className="text-sm space-y-1">
            <div>Advance Payable: <strong>₹{quotation.advanceAmount.toLocaleString()}</strong> ({quotation.advancePercent}%)</div>
            <div>Balance Amount: <strong>₹{quotation.balanceAmount.toLocaleString()}</strong></div>
            <div className="mt-2 italic text-gray-600 text-xs">Quotation valid until {formatDate(quotation.validUntil)}. Room availability is subject to change unless advance is paid.</div>
          </div>
        </div>
        
        {settings?.bankName && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="font-bold text-gray-700 mb-2">Bank Details</div>
            <div className="text-sm">
              <div>Bank: {settings.bankName}</div>
              {settings.accountName && <div>A/C Name: {settings.accountName}</div>}
              {settings.accountNumber && <div>A/C No: {settings.accountNumber}</div>}
              {settings.ifsc && <div>IFSC: {settings.ifsc}</div>}
              {settings.branch && <div>Branch: {settings.branch}</div>}
              {settings.upiId && <div>UPI: {settings.upiId}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      {settings?.termsAndConditions && (
        <div className="text-xs text-gray-600 mt-8 break-before-auto">
          <div className="font-bold mb-1">Terms & Conditions:</div>
          <div className="whitespace-pre-wrap">
            {settings.termsAndConditions}
          </div>
        </div>
      )}
      
      {/* Authorized Signatory */}
      <div className="mt-8 flex justify-end">
        <div className="text-center flex flex-col items-center">
          <img src="/stamp.png" alt="Company Stamp and Signature" className="h-24 w-24 object-contain mix-blend-multiply" />
          <div className="font-bold text-sm mt-2">Authorized Signatory</div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-12 text-center text-sm font-semibold text-primary pt-4 border-t border-gray-300">
        Thank you for choosing Gajagamini Forest Resort! We look forward to hosting you.
      </div>
      </div>
    </div>
  );
};
