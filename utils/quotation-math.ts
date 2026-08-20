import { HotelQuotation } from '@/types';

export interface QuotationCalculationResult {
  roomSubtotal: number;
  foodSubtotal: number;
  serviceSubtotal: number;
  totalSubtotal: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number;
  grandTotal: number;
}

export const calculateHotelQuotation = (
  q: Partial<HotelQuotation>
): QuotationCalculationResult => {
  const roomSubtotal = q.rooms?.reduce((acc, room) => acc + (room.subtotal || 0), 0) || 0;
  const foodSubtotal = q.food?.reduce((acc, food) => acc + (food.subtotal || 0), 0) || 0;
  const serviceSubtotal = q.services?.reduce((acc, service) => acc + (service.subtotal || 0), 0) || 0;

  const totalSubtotal = roomSubtotal + foodSubtotal + serviceSubtotal;

  let discountAmount = 0;
  if (q.discountType === 'percentage') {
    discountAmount = Math.round(totalSubtotal * (q.discountValue || 0) / 100);
  } else {
    discountAmount = q.discountValue || 0;
  }

  const taxableAmount = Math.max(0, totalSubtotal - discountAmount);
  const gstPercent = q.gstPercent || 18;
  const gstAmount = Math.round(taxableAmount * gstPercent / 100);
  const grandTotal = taxableAmount + gstAmount;

  return {
    roomSubtotal,
    foodSubtotal,
    serviceSubtotal,
    totalSubtotal,
    discountAmount,
    taxableAmount,
    gstAmount,
    grandTotal,
  };
};
