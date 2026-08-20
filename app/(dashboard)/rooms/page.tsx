'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { RoomType } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';

export default function RoomsHub() {
  const { roomTypes, addRoomType, updateRoomType, deleteRoomType, fetchAll, isLoading } = useHotelStore();
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxAdults, setMaxAdults] = useState(2);
  const [maxChildren, setMaxChildren] = useState(2);
  const [maxOccupancy, setMaxOccupancy] = useState(4);
  const [basePrice, setBasePrice] = useState(4000);
  const [extraAdultPrice, setExtraAdultPrice] = useState(1000);
  const [extraChildPrice, setExtraChildPrice] = useState(500);
  const [extraBedPrice, setExtraBedPrice] = useState(800);
  const [isActive, setIsActive] = useState(true);

  const openNewModal = () => {
    setEditingRoom(null);
    setName('');
    setDescription('');
    setMaxAdults(2);
    setMaxChildren(2);
    setMaxOccupancy(4);
    setBasePrice(4000);
    setExtraAdultPrice(1000);
    setExtraChildPrice(500);
    setExtraBedPrice(800);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (r: RoomType) => {
    setEditingRoom(r);
    setName(r.name);
    setDescription(r.description || '');
    setMaxAdults(r.maxAdults || 2);
    setMaxChildren(r.maxChildren || 2);
    setMaxOccupancy(r.maxOccupancy || 4);
    setBasePrice(r.basePrice || 0);
    setExtraAdultPrice(r.extraAdultPrice || 0);
    setExtraChildPrice(r.extraChildPrice || 0);
    setExtraBedPrice(r.extraBedPrice || 0);
    setIsActive(r.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingRoom) {
      await updateRoomType({
        ...editingRoom,
        name,
        description,
        maxAdults,
        maxChildren,
        maxOccupancy,
        basePrice,
        extraAdultPrice,
        extraChildPrice,
        extraBedPrice,
        isActive,
      });
    } else {
      await addRoomType({
        id: `room-${Date.now()}`,
        name,
        description,
        maxAdults,
        maxChildren,
        maxOccupancy,
        basePrice,
        extraAdultPrice,
        extraChildPrice,
        extraBedPrice,
        isActive,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this room type?')) {
      await deleteRoomType(id);
    }
  };

  const filtered = roomTypes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Room Types
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage hotel rooms and pricing.</p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Room Type
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search rooms..."
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
                <TableHead>Room Name</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Extra Adult/Child</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading rooms...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No rooms found</TableCell></TableRow>
              ) : (
                filtered.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium text-gray-900">{room.name}</TableCell>
                    <TableCell className="text-gray-600">
                      Up to {room.maxOccupancy} ({room.maxAdults}A + {room.maxChildren}C)
                    </TableCell>
                    <TableCell className="font-semibold text-primary">₹{room.basePrice.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">
                      ₹{room.extraAdultPrice} / ₹{room.extraChildPrice}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={room.isActive ? 'active' : 'inactive'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(room)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(room.id)}>
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
            <DialogTitle>{editingRoom ? 'Edit Room Type' : 'Add New Room Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Room Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Deluxe Room" required />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
              </div>
              
              <div className="space-y-2">
                <Label>Base Price (₹)</Label>
                <Input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label>Extra Bed Price (₹)</Label>
                <Input type="number" value={extraBedPrice} onChange={(e) => setExtraBedPrice(Number(e.target.value))} />
              </div>

              <div className="space-y-2">
                <Label>Extra Adult Price (₹)</Label>
                <Input type="number" value={extraAdultPrice} onChange={(e) => setExtraAdultPrice(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Extra Child Price (₹)</Label>
                <Input type="number" value={extraChildPrice} onChange={(e) => setExtraChildPrice(Number(e.target.value))} />
              </div>

              <div className="space-y-2">
                <Label>Max Occupancy</Label>
                <Input type="number" value={maxOccupancy} onChange={(e) => setMaxOccupancy(Number(e.target.value))} />
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
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Room</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
