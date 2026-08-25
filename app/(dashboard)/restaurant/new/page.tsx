'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRestaurantStore } from '@/lib/store/use-restaurant-store';
import { RESTAURANT_MENU, MENU_CATEGORIES, MenuItem } from '@/lib/data/restaurant-menu';
import { RestaurantBillItem } from '@/types';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

export default function NewRestaurantBill() {
  const router = useRouter();
  const { addBill } = useRestaurantStore();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [guestName, setGuestName] = useState('');
  const [tableNo, setTableNo] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const [items, setItems] = useState<RestaurantBillItem[]>([]);
  
  const [gstPercent, setGstPercent] = useState<number>(5);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Item selection state
  const [selectedCategory, setSelectedCategory] = useState<string>(MENU_CATEGORIES[0]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const filteredMenuItems = RESTAURANT_MENU.filter(item => item.category === selectedCategory);

  const handleAddItemFromMenu = () => {
    if (!selectedItemId) return;
    const menuItem = RESTAURANT_MENU.find(i => i.id === selectedItemId);
    if (!menuItem) return;

    setItems([...items, {
      id: Date.now().toString(),
      name: menuItem.name,
      category: menuItem.category,
      rate: menuItem.price,
      quantity: 1,
      amount: menuItem.price
    }]);
    
    // Reset selection slightly for faster addition of other items
    setSelectedItemId('');
  };

  const handleAddCustomItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      name: 'Custom Item',
      rate: 0,
      quantity: 1,
      amount: 0
    }]);
  };

  const updateItem = (index: number, field: keyof RestaurantBillItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * (gstPercent / 100);
  const grandTotal = Math.round(taxableAmount + gstAmount);
  const roundOff = grandTotal - (taxableAmount + gstAmount);

  const handleSave = async () => {
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      setIsSubmitting(true);
      await addBill({
        date,
        guestName,
        tableNo,
        roomNo,
        mobile,
        items,
        subtotal,
        discountPercent,
        discountAmount,
        gstPercent,
        gstAmount,
        roundOff,
        grandTotal,
        paymentMethod,
        status: 'paid'
      });
      router.push('/restaurant');
    } catch (error) {
      console.error(error);
      alert('Failed to save bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">New Restaurant Bill</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Table No (Optional)</Label>
                  <Input placeholder="e.g. T1" value={tableNo} onChange={e => setTableNo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Guest Name (Optional)</Label>
                  <Input placeholder="Walk-in Guest" value={guestName} onChange={e => setGuestName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Room No (Optional)</Label>
                  <Input placeholder="e.g. 101" value={roomNo} onChange={e => setRoomNo(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Menu Selection Area */}
              <div className="bg-slate-50 p-4 rounded-md border mb-6 flex flex-wrap gap-4 items-end">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedItemId('');
                    }}
                  >
                    {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2 flex-[2] min-w-[250px]">
                  <Label>Item</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                  >
                    <option value="">Select an item...</option>
                    {filteredMenuItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ₹{item.price}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAddItemFromMenu} disabled={!selectedItemId} type="button" className="shrink-0">
                  <Plus className="mr-2 h-4 w-4" /> Add to Order
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed">
                  No items added to the order yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 font-medium">Item Name</th>
                        <th className="text-right pb-2 font-medium w-24">Rate (₹)</th>
                        <th className="text-center pb-2 font-medium w-24">Qty</th>
                        <th className="text-right pb-2 font-medium w-24">Amount</th>
                        <th className="w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="py-2 pr-2">
                            <Input 
                              value={item.name} 
                              onChange={e => updateItem(idx, 'name', e.target.value)} 
                              className="h-8"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <Input 
                              type="number" 
                              value={item.rate || ''} 
                              onChange={e => updateItem(idx, 'rate', Number(e.target.value))} 
                              className="h-8 text-right"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <Input 
                              type="number" 
                              value={item.quantity || ''} 
                              onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} 
                              className="h-8 text-center"
                              min={1}
                            />
                          </td>
                          <td className="py-2 pl-2 text-right font-medium">
                            {item.amount}
                          </td>
                          <td className="py-2 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeItem(idx)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={handleAddCustomItem}>
                  <Plus className="mr-2 h-4 w-4" /> Add Custom Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-gray-600 text-sm">Discount (%)</Label>
                <Input 
                  type="number" 
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="h-8 text-right"
                  min="0"
                  max="100"
                />
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm text-red-600">
                  <span>Discount Amount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 items-center">
                <Label className="text-gray-600 text-sm font-bold">GST (%)</Label>
                <Input 
                  type="number" 
                  value={gstPercent} 
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  className="h-8 text-right font-bold text-primary"
                  min="0"
                />
              </div>

              {gstAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">GST Amount</span>
                  <span>+₹{gstAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold text-primary">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
                {roundOff !== 0 && (
                  <div className="text-right text-xs text-gray-500 mt-1">
                    Includes round-off: ₹{roundOff.toFixed(2)}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleSave}
            disabled={isSubmitting || items.length === 0}
          >
            <Save className="mr-2 h-5 w-5" /> 
            {isSubmitting ? 'Saving...' : 'Save Bill'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
