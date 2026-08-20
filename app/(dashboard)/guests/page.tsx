'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { Guest } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

export default function GuestsHub() {
  const { guests, addGuest, updateGuest, deleteGuest, fetchAll, isLoading } = useHotelStore();
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingGuest(null);
    setName('');
    setMobile('');
    setWhatsapp('');
    setEmail('');
    setCompany('');
    setGstin('');
    setAddress('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (g: Guest) => {
    setEditingGuest(g);
    setName(g.name);
    setMobile(g.mobile);
    setWhatsapp(g.whatsapp || '');
    setEmail(g.email || '');
    setCompany(g.company || '');
    setGstin(g.gstin || '');
    setAddress(g.address || '');
    setNotes(g.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    if (editingGuest) {
      await updateGuest({
        ...editingGuest,
        name,
        mobile,
        whatsapp,
        email,
        company,
        gstin,
        address,
        notes,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addGuest({
        id: `g-${Date.now()}`,
        name,
        mobile,
        whatsapp,
        email,
        company,
        gstin,
        address,
        notes,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this guest?')) {
      await deleteGuest(id);
    }
  };

  const filtered = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.mobile.includes(searchTerm) ||
    (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Guests Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage guest information and history.</p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Guest
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, mobile, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50/50"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading guests...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No guests found</TableCell></TableRow>
              ) : (
                filtered.map((guest) => (
                  <TableRow key={guest.id}>
                    <TableCell className="font-medium text-gray-900">{guest.name}</TableCell>
                    <TableCell className="text-gray-600">
                      <div>{guest.mobile}</div>
                      {guest.email && <div className="text-xs text-gray-500">{guest.email}</div>}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {guest.company || '-'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {guest.createdAt ? formatDate(guest.createdAt) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(guest)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(guest.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingGuest ? 'Edit Guest Details' : 'Add New Guest'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guest Name <span className="text-red-500">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number <span className="text-red-500">*</span></Label>
                <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g. 9830098300" required />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="If different" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guest@example.com" />
              </div>

              <div className="space-y-2">
                <Label>Company Name (Optional)</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="For B2B or Corporate" />
              </div>
              <div className="space-y-2">
                <Label>GSTIN</Label>
                <Input value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="GST Number" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Address</Label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Internal Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, special requirements..." />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Guest</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
