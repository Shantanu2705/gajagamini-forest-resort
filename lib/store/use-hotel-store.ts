import { create } from 'zustand';
import {
  Guest,
  RoomType,
  MealPlan,
  AdditionalService,
  HotelQuotation,
  Enquiry,
  Booking,
  Invoice,
  Receipt,
  CompanySettings,
} from '@/types';
import { HotelDatabase } from '@/services/db';

interface HotelState {
  guests: Guest[];
  roomTypes: RoomType[];
  mealPlans: MealPlan[];
  additionalServices: AdditionalService[];
  hotelQuotations: HotelQuotation[];
  enquiries: Enquiry[];
  bookings: Booking[];
  invoices: Invoice[];
  receipts: Receipt[];
  settings: CompanySettings | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  fetchAll: () => Promise<void>;

  // Guests
  addGuest: (g: Guest) => Promise<void>;
  updateGuest: (g: Guest) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;

  // RoomTypes
  addRoomType: (r: RoomType) => Promise<void>;
  updateRoomType: (r: RoomType) => Promise<void>;
  deleteRoomType: (id: string) => Promise<void>;

  // MealPlans
  addMealPlan: (m: MealPlan) => Promise<void>;
  updateMealPlan: (m: MealPlan) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;

  // AdditionalServices
  addAdditionalService: (s: AdditionalService) => Promise<void>;
  updateAdditionalService: (s: AdditionalService) => Promise<void>;
  deleteAdditionalService: (id: string) => Promise<void>;

  // HotelQuotations
  addQuotation: (q: HotelQuotation) => Promise<void>;
  updateQuotation: (q: HotelQuotation) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;

  // Enquiries
  addEnquiry: (e: Enquiry) => Promise<void>;
  updateEnquiry: (e: Enquiry) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;

  // Bookings
  addBooking: (b: Booking) => Promise<void>;
  updateBooking: (b: Booking) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  // Invoices
  addInvoice: (i: Invoice) => Promise<void>;
  updateInvoice: (i: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;

  // Receipts
  addReceipt: (r: Receipt) => Promise<void>;
  updateReceipt: (r: Receipt) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;

  // Settings
  updateSettings: (s: Partial<CompanySettings>) => Promise<void>;
}

export const useHotelStore = create<HotelState>((set, get) => ({
  guests: [],
  roomTypes: [],
  mealPlans: [],
  additionalServices: [],
  hotelQuotations: [],
  enquiries: [],
  bookings: [],
  invoices: [],
  receipts: [],
  settings: null,
  isLoading: true,
  isInitialized: false,

  fetchAll: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      const [
        guests,
        roomTypes,
        mealPlans,
        additionalServices,
        hotelQuotations,
        enquiries,
        bookings,
        invoices,
        receipts,
        settings,
      ] = await Promise.all([
        HotelDatabase.getGuests(),
        HotelDatabase.getRoomTypes(),
        HotelDatabase.getMealPlans(),
        HotelDatabase.getAdditionalServices(),
        HotelDatabase.getQuotations(),
        HotelDatabase.getEnquiries(),
        HotelDatabase.getBookings(),
        HotelDatabase.getInvoices(),
        HotelDatabase.getReceipts(),
        HotelDatabase.getSettings(),
      ]);

      set({
        guests,
        roomTypes,
        mealPlans,
        additionalServices,
        hotelQuotations,
        enquiries,
        bookings,
        invoices,
        receipts,
        settings,
        isLoading: false,
        isInitialized: true,
      });
    } catch (e) {
      console.error('Failed to load hotel data:', e);
      set({ isLoading: false, isInitialized: true });
    }
  },

  addGuest: async (g) => {
    const saved = await HotelDatabase.upsertGuest(g);
    set((s) => ({ guests: [saved, ...s.guests] }));
  },
  updateGuest: async (g) => {
    const saved = await HotelDatabase.upsertGuest(g);
    set((s) => ({ guests: s.guests.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteGuest: async (id) => {
    await HotelDatabase.deleteGuest(id);
    set((s) => ({ guests: s.guests.filter((item) => item.id !== id) }));
  },

  addRoomType: async (r) => {
    const saved = await HotelDatabase.upsertRoomType(r);
    set((s) => ({ roomTypes: [saved, ...s.roomTypes] }));
  },
  updateRoomType: async (r) => {
    const saved = await HotelDatabase.upsertRoomType(r);
    set((s) => ({ roomTypes: s.roomTypes.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteRoomType: async (id) => {
    await HotelDatabase.deleteRoomType(id);
    set((s) => ({ roomTypes: s.roomTypes.filter((item) => item.id !== id) }));
  },

  addMealPlan: async (m) => {
    const saved = await HotelDatabase.upsertMealPlan(m);
    set((s) => ({ mealPlans: [saved, ...s.mealPlans] }));
  },
  updateMealPlan: async (m) => {
    const saved = await HotelDatabase.upsertMealPlan(m);
    set((s) => ({ mealPlans: s.mealPlans.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteMealPlan: async (id) => {
    await HotelDatabase.deleteMealPlan(id);
    set((s) => ({ mealPlans: s.mealPlans.filter((item) => item.id !== id) }));
  },

  addAdditionalService: async (srv) => {
    const saved = await HotelDatabase.upsertAdditionalService(srv);
    set((s) => ({ additionalServices: [saved, ...s.additionalServices] }));
  },
  updateAdditionalService: async (srv) => {
    const saved = await HotelDatabase.upsertAdditionalService(srv);
    set((s) => ({ additionalServices: s.additionalServices.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteAdditionalService: async (id) => {
    await HotelDatabase.deleteAdditionalService(id);
    set((s) => ({ additionalServices: s.additionalServices.filter((item) => item.id !== id) }));
  },

  addQuotation: async (q) => {
    const saved = await HotelDatabase.upsertQuotation(q);
    set((s) => ({ hotelQuotations: [saved, ...s.hotelQuotations] }));
  },
  updateQuotation: async (q) => {
    const saved = await HotelDatabase.upsertQuotation(q);
    set((s) => ({ hotelQuotations: s.hotelQuotations.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteQuotation: async (id) => {
    await HotelDatabase.deleteQuotation(id);
    set((s) => ({ hotelQuotations: s.hotelQuotations.filter((item) => item.id !== id) }));
  },

  addEnquiry: async (e) => {
    const saved = await HotelDatabase.upsertEnquiry(e);
    set((s) => ({ enquiries: [saved, ...s.enquiries] }));
  },
  updateEnquiry: async (e) => {
    const saved = await HotelDatabase.upsertEnquiry(e);
    set((s) => ({ enquiries: s.enquiries.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteEnquiry: async (id) => {
    await HotelDatabase.deleteEnquiry(id);
    set((s) => ({ enquiries: s.enquiries.filter((item) => item.id !== id) }));
  },

  addBooking: async (b) => {
    const saved = await HotelDatabase.upsertBooking(b);
    set((s) => ({ bookings: [saved, ...s.bookings] }));
  },
  updateBooking: async (b) => {
    const saved = await HotelDatabase.upsertBooking(b);
    set((s) => ({ bookings: s.bookings.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteBooking: async (id) => {
    await HotelDatabase.deleteBooking(id);
    set((s) => ({ bookings: s.bookings.filter((item) => item.id !== id) }));
  },

  addInvoice: async (i) => {
    const saved = await HotelDatabase.upsertInvoice(i);
    set((s) => ({ invoices: [saved, ...s.invoices] }));
  },
  updateInvoice: async (i) => {
    const saved = await HotelDatabase.upsertInvoice(i);
    set((s) => ({ invoices: s.invoices.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteInvoice: async (id) => {
    await HotelDatabase.deleteInvoice(id);
    set((s) => ({ invoices: s.invoices.filter((item) => item.id !== id) }));
  },

  addReceipt: async (r) => {
    const saved = await HotelDatabase.upsertReceipt(r);
    set((s) => ({ receipts: [saved, ...s.receipts] }));
  },
  updateReceipt: async (r) => {
    const saved = await HotelDatabase.upsertReceipt(r);
    set((s) => ({ receipts: s.receipts.map((item) => (item.id === saved.id ? saved : item)) }));
  },
  deleteReceipt: async (id) => {
    await HotelDatabase.deleteReceipt(id);
    set((s) => ({ receipts: s.receipts.filter((item) => item.id !== id) }));
  },

  updateSettings: async (s) => {
    const updated = await HotelDatabase.updateSettings(s);
    set({ settings: updated });
  },
}));

// Export a dummy useHotelStore so that old imports don't instantly break during transition
