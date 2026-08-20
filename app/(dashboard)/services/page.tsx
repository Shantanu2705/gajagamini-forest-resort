'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { AdditionalService } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConciergeBell, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';

export default function ServicesHub() {
  const { additionalServices, addAdditionalService, updateAdditionalService, deleteAdditionalService, fetchAll, isLoading } = useHotelStore();
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdditionalService | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState(1000);
  const [isActive, setIsActive] = useState(true);

  const openNewModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setUnitPrice(1000);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: AdditionalService) => {
    setEditingService(s);
    setName(s.name);
    setDescription(s.description || '');
    setUnitPrice(s.unitPrice || 0);
    setIsActive(s.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingService) {
      await updateAdditionalService({
        ...editingService,
        name,
        description,
        unitPrice,
        isActive,
      });
    } else {
      await addAdditionalService({
        id: `srv-${Date.now()}`,
        name,
        description,
        unitPrice,
        isActive,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await deleteAdditionalService(id);
    }
  };

  const filtered = additionalServices.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ConciergeBell className="h-6 w-6 text-primary" />
            Additional Services
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage extra hotel/resort services (Bonfire, Safari, Extra Bed, etc.)</p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
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
                <TableHead>Service Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit Price (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading services...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No services found</TableCell></TableRow>
              ) : (
                filtered.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium text-gray-900">{service.name}</TableCell>
                    <TableCell className="text-gray-600 max-w-[200px] truncate">{service.description || '-'}</TableCell>
                    <TableCell className="font-semibold text-primary">₹{service.unitPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={service.isActive ? 'active' : 'inactive'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(service.id)}>
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
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bonfire with Music" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
            </div>
            
            <div className="space-y-2">
              <Label>Unit Price (₹)</Label>
              <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} required />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={isActive ? 'active' : 'inactive'} onValueChange={(v) => setIsActive(v === 'active')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Service</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
