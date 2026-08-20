import {
  Guest,
  RoomType,
  MealPlan,
  AdditionalService,
  Enquiry,
  Booking,
  HotelQuotation,
  Invoice,
  Receipt,
  CompanySettings,
  SerialCounters,
} from '@/types';

export const initialGuests: Guest[] = [
  { id: 'g-1', name: 'Rajesh Kumar', mobile: '9876543210', email: 'rajesh@example.com', address: 'Delhi', createdAt: new Date().toISOString() },
  { id: 'g-2', name: 'Priya Singh', mobile: '8765432109', email: 'priya@example.com', address: 'Mumbai', company: 'TechCorp', createdAt: new Date().toISOString() },
];

export const initialRoomTypes: RoomType[] = [
  { id: 'rt-1', name: 'Standard Room', basePrice: 2000, extraAdultPrice: 800, extraChildPrice: 500, maxOccupancy: 3, totalInventory: 10, amenities: ['WiFi', 'TV'] },
  { id: 'rt-2', name: 'Deluxe Room', basePrice: 3500, extraAdultPrice: 1000, extraChildPrice: 600, maxOccupancy: 4, totalInventory: 5, amenities: ['WiFi', 'TV', 'AC', 'Mini Fridge'] },
  { id: 'rt-3', name: 'Premium Suite', basePrice: 6000, extraAdultPrice: 1500, extraChildPrice: 800, maxOccupancy: 4, totalInventory: 2, amenities: ['WiFi', 'TV', 'AC', 'Bathtub', 'Balcony'] },
];

export const initialMealPlans: MealPlan[] = [
  { id: 'mp-1', name: 'EP (Room Only)', code: 'EP', adultPrice: 0, childPrice: 0 },
  { id: 'mp-2', name: 'CP (Breakfast)', code: 'CP', adultPrice: 300, childPrice: 200 },
  { id: 'mp-3', name: 'MAP (Breakfast + 1 Meal)', code: 'MAP', adultPrice: 800, childPrice: 500 },
  { id: 'mp-4', name: 'AP (All Meals)', code: 'AP', adultPrice: 1200, childPrice: 800 },
];

export const initialAdditionalServices: AdditionalService[] = [
  { id: 'as-1', name: 'Extra Bed', unitPrice: 500, description: 'Folding bed' },
  { id: 'as-2', name: 'Airport Transfer', unitPrice: 1500, description: 'One way drop or pickup' },
  { id: 'as-3', name: 'Jungle Safari', unitPrice: 2500, description: 'Per jeep (max 6 pax)' },
  { id: 'as-4', name: 'Bonfire Setup', unitPrice: 1000, description: 'Wood and sitting arrangement' },
];

export const initialEnquiries: Enquiry[] = [
  {
    id: 'enq-1', customerName: 'Amit Shah', mobile: '9988776655', email: 'amit@example.com', checkIn: '2026-10-15', checkOut: '2026-10-18', adults: 2, children: 1, roomTypeId: 'rt-2', status: 'new', notes: 'Needs ground floor', source: 'WhatsApp', createdAt: new Date().toISOString()
  },
  {
    id: 'enq-2', customerName: 'Neha Gupta', mobile: '9988776656', email: 'neha@example.com', checkIn: '2026-11-10', checkOut: '2026-11-12', adults: 2, children: 0, roomTypeId: 'rt-3', status: 'follow-up', notes: 'Anniversary trip', source: 'Direct Call', createdAt: new Date().toISOString()
  }
];

export const initialBookings: Booking[] = [
  {
    id: 'bkg-1', bookingNo: 'BKG-001', guestId: 'g-1', clientName: 'Rajesh Kumar', mobile: '9876543210', checkIn: '2026-10-01', checkOut: '2026-10-03', nights: 2, adults: 2, children: 0, roomIds: ['rt-1'], roomNumbers: ['101'], amount: 4000, advance: 2000, balance: 2000, status: 'confirmed', source: 'Direct', notes: '', createdAt: new Date().toISOString()
  },
  {
    id: 'bkg-2', bookingNo: 'BKG-002', guestId: 'g-2', clientName: 'Priya Singh', mobile: '8765432109', checkIn: '2026-10-05', checkOut: '2026-10-07', nights: 2, adults: 2, children: 0, roomIds: ['rt-2'], roomNumbers: ['205'], amount: 7000, advance: 7000, balance: 0, status: 'checked-in', source: 'OTA', notes: '', createdAt: new Date().toISOString()
  }
];

export const initialQuotations: HotelQuotation[] = [
  {
    id: 'hq-1', quotationNo: 'GFR-QTN-2026-001', guestId: 'g-1', guestName: 'Rajesh Kumar', guestMobile: '9876543210', guestEmail: 'rajesh@example.com', guestAddress: 'Delhi', checkIn: '2026-10-20', checkOut: '2026-10-22', nights: 2, adults: 2, children: 0, infants: 0, rooms: [ { id: 'r-1', roomId: 'rt-2', roomName: 'Deluxe Room', numberOfRooms: 1, adults: 2, children: 0, extraAdults: 0, extraChildren: 0, extraBeds: 0, nights: 2, ratePerNight: 3500, extraAdultRate: 1000, extraChildRate: 600, extraBedRate: 0, subtotal: 7000 } ], food: [ { id: 'f-1', mealPlanId: 'mp-2', mealPlanName: 'CP (Breakfast)', adults: 2, children: 0, days: 2, adultRate: 300, childRate: 200, subtotal: 1200 } ], services: [], roomSubtotal: 7000, foodSubtotal: 1200, serviceSubtotal: 0, totalSubtotal: 8200, discountType: 'percentage', discountValue: 10, discountAmount: 820, taxableAmount: 7380, gstPercent: 12, gstAmount: 885.6, grandTotal: 8265.6, advancePercent: 50, advanceAmount: 4133, balanceAmount: 4132.6, status: 'draft', validUntil: '2026-10-31', createdAt: new Date().toISOString()
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1', invoiceNo: 'HQ-INV-2026-001', guestId: 'g-1', clientName: 'Rajesh Kumar', mobile: '9876543210', address: 'Delhi', relatedQuotationId: 'hq-1', date: new Date().toISOString(), dueDate: '2026-10-22', items: [ { id: 'itm-1', description: 'Deluxe Room (2 Nights)', quantity: 1, rate: 7000, amount: 7000 }, { id: 'itm-2', description: 'CP (Breakfast)', quantity: 1, rate: 1200, amount: 1200 } ], subtotal: 8200, discount: 820, gstAmount: 885.6, totalAmount: 8265.6, advanceAmount: 4133, balanceAmount: 4132.6, status: 'partially-paid', terms: 'Standard Terms', createdAt: new Date().toISOString()
  }
];

export const initialReceipts: Receipt[] = [
  {
    id: 'rec-1', receiptNo: 'RCP-2026-001', invoiceId: 'inv-1', guestId: 'g-1', clientName: 'Rajesh Kumar', mobile: '9876543210', amount: 4133, paymentMode: 'upi', referenceNo: 'UPI987654321', date: new Date().toISOString(), remarks: 'Advance Payment', createdAt: new Date().toISOString()
  }
];

export const initialSettings: CompanySettings = {
  companyName: 'Gajagamini Forest Resort',
  logoUrl: '',
  gstPercent: 18,
  invoicePrefix: 'HQ',
  terms: '1. Standard check-in time is 12:00 PM and check-out time is 11:00 AM.\n2. Valid ID proof is mandatory at the time of check-in.',
  supportEmail: 'contact@gajagamini.com',
  whatsappNumber: '919876543210',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  upiId: '',
  qrCodeUrl: '',
  companyGstin: '',
  companyState: 'West Bengal',
  companyAddress: 'Jalpaiguri, West Bengal, India',
  companyPan: '',
  cancellationPolicy: ``
};

export const initialSerialCounters: SerialCounters = {
  hotelQuotation: { year: new Date().getFullYear(), next: 1 },
  booking: { year: new Date().getFullYear(), next: 1 },
  invoice: { year: new Date().getFullYear(), next: 1 },
  receipt: { year: new Date().getFullYear(), next: 1 },
};
