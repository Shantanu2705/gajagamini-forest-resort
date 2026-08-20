export type Role = 'admin' | 'manager' | 'operator' | string;
export type UserRole = Role;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  status?: string;
  createdAt?: string;
}

export interface Guest {
  id: string;
  name: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  company?: string;
  gstin?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  maxOccupancy?: number;
  maxAdults?: number;
  maxChildren?: number;
  basePrice: number;
  extraAdultPrice?: number;
  extraChildPrice?: number;
  extraBedPrice?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  adultPrice: number;
  childPrice: number;
  includesBreakfast?: boolean;
  includesLunch?: boolean;
  includesDinner?: boolean;
  includesSnacks?: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  isActive: boolean;
  createdAt?: string;
}

// ----------------------------------------------------
// ENQUIRY
// ----------------------------------------------------
export type EnquiryStatus = 'new' | 'follow-up' | 'quotation-sent' | 'confirmed' | 'cancelled' | string;

export interface Enquiry {
  id: string;
  enquiryNo?: string;
  customerName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomTypeId?: string;
  
  specialRequirements?: string;
  internalNotes?: string;
  status?: EnquiryStatus;
  createdAt?: string;
}

// ----------------------------------------------------
// BOOKING
// ----------------------------------------------------
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked-in' | 'checked-out' | string;

export interface Booking {
  id: string;
  bookingNo?: string;
  quotationId?: string;
  enquiryId?: string;
  
  guestId?: string;
  clientName: string;
  mobile?: string;
  
  checkIn: string;
  checkOut: string;
  roomIds?: string[];
  
  status: BookingStatus;
  amount: number;
  advance: number;
  balance?: number;
  adults?: number;
  children?: number;
  nights?: number;
  roomNumbers?: string[];
  createdAt?: string;
  notes?: string;
  source?: string;
}

// ----------------------------------------------------
// QUOTATION
// ----------------------------------------------------
export interface HotelQuotationRoomItem {
  id: string;
  roomId: string;
  roomName: string;
  numberOfRooms: number;
  adults: number;
  children: number;
  extraAdults: number;
  extraChildren: number;
  extraBeds: number;
  nights: number;
  ratePerNight: number;
  extraAdultRate: number;
  extraChildRate: number;
  extraBedRate: number;
  subtotal: number;
}

export interface HotelQuotationFoodItem {
  id: string;
  mealPlanId: string;
  mealPlanName: string;
  adults: number;
  children: number;
  days: number;
  adultRate: number;
  childRate: number;
  subtotal: number;
}

export interface HotelQuotationServiceItem {
  id: string;
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface HotelQuotation {
  id: string;
  quotationNo: string;
  guestId?: string;
  guestName: string;
  guestMobile: string;
  guestEmail?: string;
  guestAddress?: string;
  companyName?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  
  rooms: HotelQuotationRoomItem[];
  food: HotelQuotationFoodItem[];
  services: HotelQuotationServiceItem[];
  
  roomSubtotal: number;
  foodSubtotal: number;
  serviceSubtotal: number;
  totalSubtotal: number;
  
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  
  taxableAmount: number;
  gstPercent: number;
  gstAmount: number;
  
  grandTotal: number;
  advancePercent: number;
  advanceAmount: number;
  balanceAmount: number;
  
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'confirmed' | 'cancelled';
  validUntil: string;
  termsAndConditions?: string;
  paymentInstructions?: string;
  internalNotes?: string;
  
  createdAt: string;
  updatedAt?: string;
}

// Keep backward compatibility for any component mapping 'Quotation'
export type Quotation = HotelQuotation;

// ----------------------------------------------------
// INVOICE & BILLING
// ----------------------------------------------------
export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Debit Card' | 'Cheque' | string;
export type PaymentStatus = 'unpaid' | 'partially-paid' | 'paid' | 'overdue' | 'cancelled' | string;

export interface InvoiceItem {
  id?: string;
  description?: string;
  serviceDetails?: string;
  dateFrom?: string;
  dateTo?: string;
  sacCode?: string;
  quantity: number;
  rate: number;
  discountPercent?: number;
  gstPercent?: number;
  taxableAmount?: number;
  amount?: number;
  hsnSac?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  bookingId?: string;
  quotationId?: string;
  clientName: string;
  clientEmail?: string;
  clientMobile?: string;
  clientPhone?: string;
  clientAddress?: string;
  billingAddress?: string;
  clientState?: string;
  clientGst?: string;
  clientGstin?: string;
  paymentTerms?: string;
  
  date?: string;
  issueDate?: string;
  dueDate?: string;
  items: InvoiceItem[];
  
  subtotal: number;
  gstPercent?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  gstAmount: number;
  roundOff?: number;
  totalAmount: number;
  hasGst?: boolean;
  
  paidAmount: number;
  advanceReceived?: number;
  balanceAmount: number;
  status: PaymentStatus;
  
  notes?: string;
  terms?: string;
  placeOfIssue?: string;
  signatoryName?: string;
  disclaimerNote?: string;
  extraNote?: string;
  supplyType?: string;
}

export type ReceiptType = 'Confirmation cum Advance Receipt' | 'Advance Receipt' | 'Full Payment Receipt' | 'Booking Confirmation' | string;

export interface Receipt {
  id: string;
  receiptNo: string;
  invoiceId?: string;
  bookingId?: string;
  clientName: string;
  clientMobile?: string;
  date?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  method?: PaymentMethod;
  referenceNo?: string;
  receiptType?: ReceiptType;
  notes?: string;
  
  quotationNo?: string;
  bookingReference?: string;
  stayDetails?: string;
  
  grandTotal?: number;
  advancePercent?: number;
  advanceAmount?: number;
  receivedAmount?: number;
  paymentDate?: string;
  receivedBy?: string;
  remarks?: string;

  receiptHeading?: string;
  businessHouse?: string;
  pax?: string;
  packageType?: string;
  vehicleDetails?: string;
  duty?: string;
  includes?: string;
  costingOverride?: string;
  advanceLineOverride?: string;
  checkedByName?: string;
  designation?: string;
  destination?: string;
  travelStart?: string;
  travelEnd?: string;
}

// ----------------------------------------------------
// UTILS
// ----------------------------------------------------
export interface SerialCounterItem {
  year: number;
  next: number;
}

export interface SerialCounters {
  hotelQuotation: SerialCounterItem;
  booking: SerialCounterItem;
  invoice: SerialCounterItem;
  receipt: SerialCounterItem;
}

export interface CompanySettings {
  companyName?: string;
  logoUrl?: string;
  gstPercent?: number;
  invoicePrefix?: string;
  terms?: string;
  termsAndConditions?: string;
  supportEmail?: string;
  email?: string;
  whatsappNumber?: string;
  phone?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  branch?: string;
  upiId?: string;
  qrCodeUrl?: string;
  companyGstin?: string;
  gstin?: string;
  companyState?: string;
  companyAddress?: string;
  address?: string;
  website?: string;
  companyPan?: string;
  cancellationPolicy?: string;
  signatureUrl?: string;
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  adminFullName?: string;
  adminEmail?: string;
}
