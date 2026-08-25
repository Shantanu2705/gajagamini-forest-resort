import { create } from 'zustand';
import { RestaurantBill, CompanySettings } from '@/types';
import { HotelDatabase } from '@/services/db';

interface RestaurantStoreState {
  bills: RestaurantBill[];
  isLoading: boolean;
  settings: CompanySettings | null;
  fetchAll: () => Promise<void>;
  addBill: (bill: Partial<RestaurantBill>) => Promise<RestaurantBill>;
  deleteBill: (id: string) => Promise<void>;
}

export const useRestaurantStore = create<RestaurantStoreState>((set) => ({
  bills: [],
  isLoading: false,
  settings: null,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const [billsData, settingsData] = await Promise.all([
        HotelDatabase.getRestaurantBills(),
        HotelDatabase.getSettings()
      ]);
      set({ 
        bills: billsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),
        settings: settingsData,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch restaurant bills:', error);
      set({ isLoading: false });
    }
  },

  addBill: async (billData) => {
    try {
      const billNo = await HotelDatabase.nextSerial('restaurantBill');
      
      const newBill: RestaurantBill = {
        id: `rb-${Date.now()}`,
        billNo,
        date: billData.date || new Date().toISOString(),
        guestName: billData.guestName || '',
        tableNo: billData.tableNo || '',
        roomNo: billData.roomNo || '',
        mobile: billData.mobile || '',
        items: billData.items || [],
        subtotal: billData.subtotal || 0,
        discountPercent: billData.discountPercent || 0,
        discountAmount: billData.discountAmount || 0,
        gstPercent: billData.gstPercent || 0,
        gstAmount: billData.gstAmount || 0,
        roundOff: billData.roundOff || 0,
        grandTotal: billData.grandTotal || 0,
        status: billData.status || 'paid',
        paymentMethod: billData.paymentMethod || 'Cash',
        notes: billData.notes || '',
        createdAt: new Date().toISOString(),
      };
      
      const saved = await HotelDatabase.upsertRestaurantBill(newBill);
      set((state) => ({ bills: [saved, ...state.bills] }));
      return saved;
    } catch (error) {
      console.error('Failed to add restaurant bill:', error);
      throw error;
    }
  },

  deleteBill: async (id: string) => {
    try {
      await HotelDatabase.deleteRestaurantBill(id);
      set((state) => ({ bills: state.bills.filter(b => b.id !== id) }));
    } catch (error) {
      console.error('Failed to delete restaurant bill:', error);
      throw error;
    }
  }
}));
