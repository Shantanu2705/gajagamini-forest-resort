'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash2, Save, Eye, Printer, Download } from 'lucide-react';
import { HotelQuotationRoomItem, HotelQuotationFoodItem, HotelQuotationServiceItem } from '@/types';
// We'll replace the old PdfPreviewModal later, or stub it for now
// import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';

function NewHotelQuotationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');
  const { 
    fetchAll, 
    guests, 
    roomTypes, 
    mealPlans, 
    additionalServices, 
    addQuotation, 
    updateQuotation 
  } = useHotelStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (editId) {
      const existing = useHotelStore.getState().hotelQuotations.find(q => q.id === editId);
      if (existing) {
        setGuestId(existing.guestId || 'new');
        setGuestName(existing.guestName);
        setGuestMobile(existing.guestMobile);
        setGuestEmail(existing.guestEmail || '');
        setGuestAddress(existing.guestAddress || '');
        setCompanyName(existing.companyName || '');
        setCheckIn(existing.checkIn);
        setCheckOut(existing.checkOut);
        setAdults(existing.adults);
        setChildren(existing.children);
        setInfants(existing.infants);
        setRooms(existing.rooms || []);
        setFood(existing.food || []);
        setServices(existing.services || []);
        setDiscountType(existing.discountType);
        setDiscountValue(existing.discountValue);
        setGstPercent(existing.gstPercent);
        setAdvancePercent(existing.advancePercent);
      }
    }
  }, [editId]);

  const [step, setStep] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Step 1: Guest Information
  const [guestId, setGuestId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Step 2: Stay Details
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Nights calculation
  const getDaysBetween = (start: string, end: string) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 1;
  };
  const nights = getDaysBetween(checkIn, checkOut);

  // Step 3: Room Details
  const [rooms, setRooms] = useState<HotelQuotationRoomItem[]>([]);
  
  const addRoomRow = () => {
    setRooms([
      ...rooms,
      {
        id: `r-${Date.now()}`,
        roomId: '',
        roomName: '',
        numberOfRooms: 1,
        adults: 2,
        children: 0,
        extraAdults: 0,
        extraChildren: 0,
        extraBeds: 0,
        nights,
        ratePerNight: 0,
        extraAdultRate: 0,
        extraChildRate: 0,
        extraBedRate: 0,
        subtotal: 0,
      }
    ]);
  };

  const updateRoom = (id: string, field: keyof HotelQuotationRoomItem, value: any) => {
    setRooms(rooms.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      
      // Auto-fill rates if room type is selected
      if (field === 'roomId' && value) {
        const rt = roomTypes.find(t => t.id === value);
        if (rt) {
          updated.roomName = rt.name;
          updated.ratePerNight = rt.basePrice;
          updated.extraAdultRate = rt.extraAdultPrice || 0;
          updated.extraChildRate = rt.extraChildPrice || 0;
          updated.extraBedRate = rt.extraBedPrice || 0;
        }
      }

      // Calculate subtotal
      const roomTotal = updated.numberOfRooms * updated.ratePerNight * updated.nights;
      const extraAdultTotal = updated.extraAdults * updated.extraAdultRate * updated.nights;
      const extraChildTotal = updated.extraChildren * updated.extraChildRate * updated.nights;
      const extraBedTotal = updated.extraBeds * updated.extraBedRate * updated.nights;
      
      updated.subtotal = roomTotal + extraAdultTotal + extraChildTotal + extraBedTotal;
      return updated;
    }));
  };

  const removeRoom = (id: string) => setRooms(rooms.filter(r => r.id !== id));

  // Step 4: Food / Meal Plan
  const [food, setFood] = useState<HotelQuotationFoodItem[]>([]);
  const addFoodRow = () => {
    setFood([...food, { id: `f-${Date.now()}`, mealPlanId: '', mealPlanName: '', adults: adults, children: children, days: nights, adultRate: 0, childRate: 0, subtotal: 0 }]);
  };

  const updateFood = (id: string, field: keyof HotelQuotationFoodItem, value: any) => {
    setFood(food.map(f => {
      if (f.id !== id) return f;
      const updated = { ...f, [field]: value };
      
      if (field === 'mealPlanId' && value) {
        const mp = mealPlans.find(p => p.id === value);
        if (mp) {
          updated.mealPlanName = mp.name;
          updated.adultRate = mp.adultPrice;
          updated.childRate = mp.childPrice;
        }
      }

      updated.subtotal = (updated.adults * updated.adultRate * updated.days) + (updated.children * updated.childRate * updated.days);
      return updated;
    }));
  };

  const removeFood = (id: string) => setFood(food.filter(f => f.id !== id));

  // Step 5: Services
  const [services, setServices] = useState<HotelQuotationServiceItem[]>([]);
  const addServiceRow = () => {
    setServices([...services, { id: `s-${Date.now()}`, serviceId: '', serviceName: '', quantity: 1, unitPrice: 0, subtotal: 0 }]);
  };

  const updateService = (id: string, field: keyof HotelQuotationServiceItem, value: any) => {
    setServices(services.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      
      if (field === 'serviceId' && value) {
        const srv = additionalServices.find(a => a.id === value);
        if (srv) {
          updated.serviceName = srv.name;
          updated.unitPrice = srv.unitPrice;
        }
      }

      updated.subtotal = updated.quantity * updated.unitPrice;
      return updated;
    }));
  };

  const removeService = (id: string) => setServices(services.filter(s => s.id !== id));

  // Totals
  const roomSubtotal = rooms.reduce((acc, r) => acc + r.subtotal, 0);
  const foodSubtotal = food.reduce((acc, f) => acc + f.subtotal, 0);
  const serviceSubtotal = services.reduce((acc, s) => acc + s.subtotal, 0);
  const totalSubtotal = roomSubtotal + foodSubtotal + serviceSubtotal;

  const [discountType, setDiscountType] = useState<'percentage'|'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  
  const discountAmount = discountType === 'percentage' ? (totalSubtotal * discountValue / 100) : discountValue;
  const taxableAmount = totalSubtotal - discountAmount;
  
  const [gstPercent, setGstPercent] = useState(12);
  const gstAmount = taxableAmount * (gstPercent / 100);
  
  const grandTotal = taxableAmount + gstAmount;
  
  const [advancePercent, setAdvancePercent] = useState(50);
  const advanceAmount = Math.round(grandTotal * (advancePercent / 100));
  const balanceAmount = grandTotal - advanceAmount;

  const handleGuestSelect = (val: string) => {
    setGuestId(val);
    if (val === 'new') {
      setGuestName(''); setGuestMobile(''); setGuestEmail(''); setGuestAddress(''); setCompanyName('');
      return;
    }
    const g = guests.find(x => x.id === val);
    if (g) {
      setGuestName(g.name);
      setGuestMobile(g.mobile);
      setGuestEmail(g.email || '');
      setGuestAddress(g.address || '');
      setCompanyName(g.company || '');
    }
  };

  const handleSaveQuotation = async () => {
    if (!guestName || !guestMobile || !checkIn || !checkOut) {
      alert("Please fill Guest Name, Mobile, Check-In, and Check-Out");
      return;
    }
    const quotationNo = `GFR-QTN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await addQuotation({
      id: editId || `hq-${Date.now()}`,
      quotationNo,
      guestId: guestId !== 'new' ? guestId : undefined,
      guestName, guestMobile, guestEmail, guestAddress, companyName,
      checkIn, checkOut, nights, adults, children, infants,
      rooms, food, services,
      roomSubtotal, foodSubtotal, serviceSubtotal, totalSubtotal,
      discountType, discountValue, discountAmount,
      taxableAmount, gstPercent, gstAmount, grandTotal,
      advancePercent, advanceAmount, balanceAmount,
      status: 'draft',
      validUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString()
    });
    router.push('/quotations');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h1 className="text-2xl font-bold">Create New Quotation</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}><Eye className="h-4 w-4 mr-2" /> Preview</Button>
          <Button onClick={handleSaveQuotation}><Save className="h-4 w-4 mr-2" /> Save Quotation</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: GUEST */}
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3"><CardTitle className="text-lg">1. Guest Information</CardTitle></CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Select Existing Guest or New</Label>
                <Select value={guestId} onValueChange={handleGuestSelect}>
                  <SelectTrigger><SelectValue placeholder="-- New Guest --" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">-- Create New Guest --</SelectItem>
                    {guests.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({g.mobile})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Guest Name *</Label><Input value={guestName} onChange={e=>setGuestName(e.target.value)} /></div>
              <div className="space-y-1"><Label>Mobile *</Label><Input value={guestMobile} onChange={e=>setGuestMobile(e.target.value)} /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={guestEmail} onChange={e=>setGuestEmail(e.target.value)} /></div>
              <div className="space-y-1"><Label>Company Name</Label><Input value={companyName} onChange={e=>setCompanyName(e.target.value)} /></div>
              <div className="col-span-2 space-y-1"><Label>Address</Label><Textarea value={guestAddress} onChange={e=>setGuestAddress(e.target.value)} rows={2} /></div>
            </CardContent>
          </Card>

          {/* STEP 2: STAY */}
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3"><CardTitle className="text-lg">2. Stay Details</CardTitle></CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Check-in Date *</Label><Input type="date" value={checkIn} onChange={e=>setCheckIn(e.target.value)} /></div>
              <div className="space-y-1"><Label>Check-out Date *</Label><Input type="date" value={checkOut} onChange={e=>setCheckOut(e.target.value)} /></div>
              <div className="space-y-1"><Label>Adults</Label><Input type="number" min={1} value={adults} onChange={e=>setAdults(Number(e.target.value))} /></div>
              <div className="space-y-1 flex gap-2">
                <div className="flex-1"><Label>Children</Label><Input type="number" min={0} value={children} onChange={e=>setChildren(Number(e.target.value))} /></div>
                <div className="flex-1"><Label>Infants</Label><Input type="number" min={0} value={infants} onChange={e=>setInfants(Number(e.target.value))} /></div>
              </div>
              <div className="col-span-2 p-3 bg-blue-50 rounded-md border border-blue-100 flex justify-between font-semibold text-blue-900">
                <span>Total Nights: {nights}</span>
                <span>Total Guests: {adults + children + infants}</span>
              </div>
            </CardContent>
          </Card>

          {/* STEP 3: ROOMS */}
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">3. Room Details</CardTitle>
              <Button size="sm" variant="outline" onClick={addRoomRow}><Plus className="h-4 w-4 mr-1"/> Add Room</Button>
            </CardHeader>
            <CardContent className="p-0">
              {rooms.length === 0 ? <div className="p-4 text-center text-gray-500">No rooms added.</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 border-b text-gray-700">
                      <tr>
                        <th className="p-2">Room Type</th>
                        <th className="p-2 w-16">Qty</th>
                        <th className="p-2 w-16">Nights</th>
                        <th className="p-2 w-24">Rate/Nt (₹)</th>
                        <th className="p-2 w-24">Subtotal (₹)</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rooms.map(room => (
                        <React.Fragment key={room.id}>
                          <tr>
                            <td className="p-2">
                              <Select value={room.roomId} onValueChange={(v) => updateRoom(room.id, 'roomId', v)}>
                                <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                                <SelectContent>
                                  {roomTypes.map(rt => <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>)}
                                  <SelectItem value="custom">Custom Room</SelectItem>
                                </SelectContent>
                              </Select>
                              {room.roomId === 'custom' && (
                                <Input className="mt-1" placeholder="Room Name" value={room.roomName} onChange={e=>updateRoom(room.id, 'roomName', e.target.value)} />
                              )}
                            </td>
                            <td className="p-2"><Input type="number" min={1} value={room.numberOfRooms} onChange={e=>updateRoom(room.id, 'numberOfRooms', Number(e.target.value))} /></td>
                            <td className="p-2"><Input type="number" min={1} value={room.nights} onChange={e=>updateRoom(room.id, 'nights', Number(e.target.value))} /></td>
                            <td className="p-2"><Input type="number" min={0} value={room.ratePerNight} onChange={e=>updateRoom(room.id, 'ratePerNight', Number(e.target.value))} /></td>
                            <td className="p-2 font-medium">₹{room.subtotal}</td>
                            <td className="p-2 text-center">
                              <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => removeRoom(room.id)}><Trash2 className="h-4 w-4" /></Button>
                            </td>
                          </tr>
                          {/* Extra bed row optional expansion could go here */}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 4: FOOD */}
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">4. Food & Meal Plans</CardTitle>
              <Button size="sm" variant="outline" onClick={addFoodRow}><Plus className="h-4 w-4 mr-1"/> Add Meal Plan</Button>
            </CardHeader>
            <CardContent className="p-0">
              {food.length === 0 ? <div className="p-4 text-center text-gray-500">No meal plans added.</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 border-b text-gray-700">
                      <tr>
                        <th className="p-2">Meal Plan</th>
                        <th className="p-2 w-16">Adlt</th>
                        <th className="p-2 w-16">Chld</th>
                        <th className="p-2 w-16">Days</th>
                        <th className="p-2 w-20">Adlt Rate</th>
                        <th className="p-2 w-20">Chld Rate</th>
                        <th className="p-2 w-24">Subtotal (₹)</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {food.map(f => (
                        <tr key={f.id}>
                          <td className="p-2">
                            <Select value={f.mealPlanId} onValueChange={(v) => updateFood(f.id, 'mealPlanId', v)}>
                              <SelectTrigger><SelectValue placeholder="Select Plan" /></SelectTrigger>
                              <SelectContent>
                                {mealPlans.map(mp => <SelectItem key={mp.id} value={mp.id}>{mp.name}</SelectItem>)}
                                <SelectItem value="custom">Custom Plan</SelectItem>
                              </SelectContent>
                            </Select>
                            {f.mealPlanId === 'custom' && (
                                <Input className="mt-1" placeholder="Plan Name" value={f.mealPlanName} onChange={e=>updateFood(f.id, 'mealPlanName', e.target.value)} />
                            )}
                          </td>
                          <td className="p-2"><Input type="number" min={0} value={f.adults} onChange={e=>updateFood(f.id, 'adults', Number(e.target.value))} /></td>
                          <td className="p-2"><Input type="number" min={0} value={f.children} onChange={e=>updateFood(f.id, 'children', Number(e.target.value))} /></td>
                          <td className="p-2"><Input type="number" min={1} value={f.days} onChange={e=>updateFood(f.id, 'days', Number(e.target.value))} /></td>
                          <td className="p-2"><Input type="number" min={0} value={f.adultRate} onChange={e=>updateFood(f.id, 'adultRate', Number(e.target.value))} /></td>
                          <td className="p-2"><Input type="number" min={0} value={f.childRate} onChange={e=>updateFood(f.id, 'childRate', Number(e.target.value))} /></td>
                          <td className="p-2 font-medium">₹{f.subtotal}</td>
                          <td className="p-2 text-center">
                            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => removeFood(f.id)}><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 5: SERVICES */}
          <Card>
            <CardHeader className="bg-gray-50 border-b py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">5. Additional Services</CardTitle>
              <Button size="sm" variant="outline" onClick={addServiceRow}><Plus className="h-4 w-4 mr-1"/> Add Service</Button>
            </CardHeader>
            <CardContent className="p-0">
              {services.length === 0 ? <div className="p-4 text-center text-gray-500">No services added.</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 border-b text-gray-700">
                      <tr>
                        <th className="p-2">Service</th>
                        <th className="p-2 w-20">Qty</th>
                        <th className="p-2 w-32">Unit Price (₹)</th>
                        <th className="p-2 w-24">Subtotal (₹)</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {services.map(s => (
                        <tr key={s.id}>
                          <td className="p-2">
                            <Select value={s.serviceId} onValueChange={(v) => updateService(s.id, 'serviceId', v)}>
                              <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                              <SelectContent>
                                {additionalServices.map(srv => <SelectItem key={srv.id} value={srv.id}>{srv.name}</SelectItem>)}
                                <SelectItem value="custom">Custom Service</SelectItem>
                              </SelectContent>
                            </Select>
                            {s.serviceId === 'custom' && (
                                <Input className="mt-1" placeholder="Service Name" value={s.serviceName} onChange={e=>updateService(s.id, 'serviceName', e.target.value)} />
                            )}
                          </td>
                          <td className="p-2"><Input type="number" min={1} value={s.quantity} onChange={e=>updateService(s.id, 'quantity', Number(e.target.value))} /></td>
                          <td className="p-2"><Input type="number" min={0} value={s.unitPrice} onChange={e=>updateService(s.id, 'unitPrice', Number(e.target.value))} /></td>
                          <td className="p-2 font-medium">₹{s.subtotal}</td>
                          <td className="p-2 text-center">
                            <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8" onClick={() => removeService(s.id)}><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* STEP 6: SUMMARY */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="bg-primary text-primary-foreground py-4 rounded-t-lg">
              <CardTitle className="text-xl">Quotation Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rooms Total</span>
                <span className="font-medium">₹{roomSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Food Total</span>
                <span className="font-medium">₹{foodSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Services Total</span>
                <span className="font-medium">₹{serviceSubtotal.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-gray-800">
                <span>Subtotal</span>
                <span>₹{totalSubtotal.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Select value={discountType} onValueChange={(v: 'percentage'|'fixed') => setDiscountType(v)}>
                    <SelectTrigger className="w-28 text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">% Discount</SelectItem>
                      <SelectItem value="fixed">₹ Flat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" className="h-8 text-right" value={discountValue} onChange={e=>setDiscountValue(Number(e.target.value))} />
                </div>
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 border-t pt-2">
                  <span>Taxable Amount</span>
                  <span>₹{taxableAmount.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs w-16">GST %</Label>
                  <Input type="number" className="h-8 text-right flex-1" value={gstPercent} onChange={e=>setGstPercent(Number(e.target.value))} />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST Amount</span>
                  <span>+ ₹{gstAmount.toLocaleString()}</span>
                </div>

                <div className="border-t pt-3 mt-3 flex justify-between text-xl font-bold text-primary">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>

                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
                    <Label className="text-xs">Advance Required %</Label>
                    <Input type="number" className="h-8 w-20 text-right" value={advancePercent} onChange={e=>setAdvancePercent(Number(e.target.value))} />
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-blue-700 bg-blue-50 p-2 rounded">
                    <span>Advance Payable</span>
                    <span>₹{advanceAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Balance Amount</span>
                    <span>₹{balanceAmount.toLocaleString()}</span>
                  </div>
                </div>

              </div>
              <Button size="lg" className="w-full mt-4" onClick={handleSaveQuotation}>
                <Save className="h-5 w-5 mr-2" /> Save Quotation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="pb-24" />
    </DashboardLayout>
  );
}

export default function NewHotelQuotation() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <NewHotelQuotationInner />
    </Suspense>
  );
}
