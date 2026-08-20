import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
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
  SerialCounters,
} from '@/types';

// Helper to check if Firebase is configured with real credentials
const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key' &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-himalayan-project'
  );
};

// Generic helper for localStorage synchronization in dev/demo mode
const getLocalData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(`gajagamini-db-${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalData = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`gajagamini-db-${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local DB data:', e);
  }
};

export class HotelDatabase {
  // --- GUESTS ---
  static async getGuests(): Promise<Guest[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'guests'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest));
        }
      } catch (e) {
        console.warn('Firestore fetch failed, falling back to local DB:', e);
      }
    }
    return getLocalData<Guest[]>('guests', []);
  }

  static async upsertGuest(guest: Guest): Promise<Guest> {
    const id = guest.id || `g-${Date.now()}`;
    const newGuest = { ...guest, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'guests', id), newGuest);
        return newGuest;
      } catch (e) {
        console.warn('Firestore upsert failed, using local DB:', e);
      }
    }
    const current = getLocalData<Guest[]>('guests', []);
    const index = current.findIndex((v) => v.id === id);
    if (index >= 0) current[index] = newGuest;
    else current.unshift(newGuest);
    setLocalData('guests', current);
    return newGuest;
  }

  static async deleteGuest(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'guests', id));
        return;
      } catch (e) {
        console.warn('Firestore delete failed, using local DB:', e);
      }
    }
    const current = getLocalData<Guest[]>('guests', []);
    setLocalData('guests', current.filter((v) => v.id !== id));
  }

  // --- ROOM TYPES ---
  static async getRoomTypes(): Promise<RoomType[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'roomTypes'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RoomType));
        }
      } catch (e) {
        console.warn('Firestore fetch failed:', e);
      }
    }
    return getLocalData<RoomType[]>('roomTypes', []);
  }

  static async upsertRoomType(roomType: RoomType): Promise<RoomType> {
    const id = roomType.id || `r-${Date.now()}`;
    const newRoomType = { ...roomType, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'roomTypes', id), newRoomType);
        return newRoomType;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<RoomType[]>('roomTypes', []);
    const index = current.findIndex((d) => d.id === id);
    if (index >= 0) current[index] = newRoomType;
    else current.unshift(newRoomType);
    setLocalData('roomTypes', current);
    return newRoomType;
  }

  static async deleteRoomType(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'roomTypes', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<RoomType[]>('roomTypes', []);
    setLocalData('roomTypes', current.filter((d) => d.id !== id));
  }

  // --- MEAL PLANS ---
  static async getMealPlans(): Promise<MealPlan[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'mealPlans'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealPlan));
        }
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<MealPlan[]>('mealPlans', []);
  }

  static async upsertMealPlan(mealPlan: MealPlan): Promise<MealPlan> {
    const id = mealPlan.id || `mp-${Date.now()}`;
    const newMealPlan = { ...mealPlan, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'mealPlans', id), newMealPlan);
        return newMealPlan;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<MealPlan[]>('mealPlans', []);
    const index = current.findIndex((c) => c.id === id);
    if (index >= 0) current[index] = newMealPlan;
    else current.unshift(newMealPlan);
    setLocalData('mealPlans', current);
    return newMealPlan;
  }

  static async deleteMealPlan(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'mealPlans', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<MealPlan[]>('mealPlans', []);
    setLocalData('mealPlans', current.filter((c) => c.id !== id));
  }

  // --- ADDITIONAL SERVICES ---
  static async getAdditionalServices(): Promise<AdditionalService[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'additionalServices'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdditionalService));
        }
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<AdditionalService[]>('additionalServices', []);
  }

  static async upsertAdditionalService(service: AdditionalService): Promise<AdditionalService> {
    const id = service.id || `as-${Date.now()}`;
    const newService = { ...service, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'additionalServices', id), newService);
        return newService;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<AdditionalService[]>('additionalServices', []);
    const index = current.findIndex((e) => e.id === id);
    if (index >= 0) current[index] = newService;
    else current.unshift(newService);
    setLocalData('additionalServices', current);
    return newService;
  }

  static async deleteAdditionalService(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'additionalServices', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<AdditionalService[]>('additionalServices', []);
    setLocalData('additionalServices', current.filter((e) => e.id !== id));
  }

  // --- ENQUIRIES ---
  static async getEnquiries(): Promise<Enquiry[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'enquiries'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Enquiry));
        }
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<Enquiry[]>('enquiries', []);
  }

  static async upsertEnquiry(enq: Enquiry): Promise<Enquiry> {
    const id = enq.id || `e-${Date.now()}`;
    const newEnq = { ...enq, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'enquiries', id), newEnq);
        return newEnq;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Enquiry[]>('enquiries', []);
    const index = current.findIndex((e) => e.id === id);
    if (index >= 0) current[index] = newEnq;
    else current.unshift(newEnq);
    setLocalData('enquiries', current);
    return newEnq;
  }

  static async deleteEnquiry(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'enquiries', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Enquiry[]>('enquiries', []);
    setLocalData('enquiries', current.filter((e) => e.id !== id));
  }

  // --- BOOKINGS ---
  static async getBookings(): Promise<Booking[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'bookings'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        }
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<Booking[]>('bookings', []);
  }

  static async upsertBooking(booking: Booking): Promise<Booking> {
    const id = booking.id || `b-${Date.now()}`;
    const newBooking = { ...booking, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'bookings', id), newBooking);
        return newBooking;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Booking[]>('bookings', []);
    const index = current.findIndex((b) => b.id === id);
    if (index >= 0) current[index] = newBooking;
    else current.unshift(newBooking);
    setLocalData('bookings', current);
    return newBooking;
  }

  static async deleteBooking(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Booking[]>('bookings', []);
    setLocalData('bookings', current.filter((b) => b.id !== id));
  }

  // --- HOTEL QUOTATIONS ---
  static async getQuotations(): Promise<HotelQuotation[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'hotelQuotations'));
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as HotelQuotation));
        }
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<HotelQuotation[]>('hotelQuotations', []);
  }

  static async upsertQuotation(quotation: HotelQuotation): Promise<HotelQuotation> {
    const id = quotation.id || `hq-${Date.now()}`;
    const newQuotation = { ...quotation, id, updatedAt: new Date().toISOString() };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'hotelQuotations', id), newQuotation);
        return newQuotation;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<HotelQuotation[]>('hotelQuotations', []);
    const index = current.findIndex((b) => b.id === id);
    if (index >= 0) current[index] = newQuotation;
    else current.unshift(newQuotation);
    setLocalData('hotelQuotations', current);
    return newQuotation;
  }

  static async deleteQuotation(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'hotelQuotations', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<HotelQuotation[]>('hotelQuotations', []);
    setLocalData('hotelQuotations', current.filter((b) => b.id !== id));
  }

  // --- INVOICES & RECEIPTS ---
  static async getInvoices(): Promise<Invoice[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'invoices'));
        if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Invoice));
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<Invoice[]>('invoices', []);
  }

  static async upsertInvoice(invoice: Invoice): Promise<Invoice> {
    const id = invoice.id || `inv-${Date.now()}`;
    const newInv = { ...invoice, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'invoices', id), newInv);
        return newInv;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Invoice[]>('invoices', []);
    const index = current.findIndex((i) => i.id === id);
    if (index >= 0) current[index] = newInv;
    else current.unshift(newInv);
    setLocalData('invoices', current);
    return newInv;
  }

  static async deleteInvoice(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'invoices', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Invoice[]>('invoices', []);
    setLocalData('invoices', current.filter((i) => i.id !== id));
  }

  static async getReceipts(): Promise<Receipt[]> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'receipts'));
        if (!snap.empty) return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Receipt));
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<Receipt[]>('receipts', []);
  }

  static async upsertReceipt(receipt: Receipt): Promise<Receipt> {
    const id = receipt.id || `rec-${Date.now()}`;
    const newRec = { ...receipt, id };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'receipts', id), newRec);
        return newRec;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Receipt[]>('receipts', []);
    const index = current.findIndex((r) => r.id === id);
    if (index >= 0) current[index] = newRec;
    else current.unshift(newRec);
    setLocalData('receipts', current);
    return newRec;
  }

  static async deleteReceipt(id: string): Promise<void> {
    if (isFirebaseConfigured() && db) {
      try {
        await deleteDoc(doc(db, 'receipts', id));
        return;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    const current = getLocalData<Receipt[]>('receipts', []);
    setLocalData('receipts', current.filter((r) => r.id !== id));
  }

  // --- SETTINGS ---
  static async getSettings(): Promise<CompanySettings> {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'company'));
        if (snap.exists()) return snap.data() as CompanySettings;
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    return getLocalData<CompanySettings>('settings', {});
  }

  static async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'settings', 'company'), updated);
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    setLocalData('settings', updated);
    return updated;
  }

  static async nextSerial(type: 'hotelQuotation' | 'booking' | 'invoice' | 'receipt'): Promise<string> {
    const current = getLocalData<SerialCounters>('serialCounters', {
      hotelQuotation: { year: 2024, next: 1 },
      booking: { year: 2024, next: 1 },
      invoice: { year: 2024, next: 1 },
      receipt: { year: 2024, next: 1 },
    });
    const year = new Date().getFullYear();
    const item = current[type] || { year, next: 1 };
    const validItem = item.year === year ? item : { year, next: 1 };
    
    let prefix = 'HQ';
    if (type === 'booking') prefix = 'BK';
    else if (type === 'invoice') prefix = 'INV';
    else if (type === 'receipt') prefix = 'REC';

    const serialStr = `${prefix}-${year}-${String(validItem.next).padStart(4, '0')}`;
    current[type] = { year, next: validItem.next + 1 };
    setLocalData('serialCounters', current);
    return serialStr;
  }
}

// Keep export of FleetDatabase for compatibility while renaming
export const FleetDatabase = HotelDatabase;
