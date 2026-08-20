'use client';
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { MealPlan } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';

export default function MealPlansHub() {
  const { mealPlans, addMealPlan, updateMealPlan, deleteMealPlan, fetchAll, isLoading } = useHotelStore();
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adultPrice, setAdultPrice] = useState(1500);
  const [childPrice, setChildPrice] = useState(750);
  const [isActive, setIsActive] = useState(true);

  const openNewModal = () => {
    setEditingPlan(null);
    setName('');
    setDescription('');
    setAdultPrice(1500);
    setChildPrice(750);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (m: MealPlan) => {
    setEditingPlan(m);
    setName(m.name);
    setDescription(m.description || '');
    setAdultPrice(m.adultPrice || 0);
    setChildPrice(m.childPrice || 0);
    setIsActive(m.isActive ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingPlan) {
      await updateMealPlan({
        ...editingPlan,
        name,
        description,
        adultPrice,
        childPrice,
        isActive,
      });
    } else {
      await addMealPlan({
        id: `mp-${Date.now()}`,
        name,
        description,
        adultPrice,
        childPrice,
        isActive,
        createdAt: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      await deleteMealPlan(id);
    }
  };

  const filtered = mealPlans.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            Meal Plans
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage food packages and pricing.</p>
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Meal Plan
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search plans..."
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
                <TableHead>Plan Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Adult Price (₹)</TableHead>
                <TableHead>Child Price (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading meal plans...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No meal plans found</TableCell></TableRow>
              ) : (
                filtered.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium text-gray-900">{plan.name}</TableCell>
                    <TableCell className="text-gray-600 max-w-[200px] truncate">{plan.description || '-'}</TableCell>
                    <TableCell className="font-semibold text-primary">₹{plan.adultPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">₹{plan.childPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={plan.isActive ? 'active' : 'inactive'} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(plan.id)}>
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
            <DialogTitle>{editingPlan ? 'Edit Meal Plan' : 'Add New Meal Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MAP (Breakfast + Dinner)" required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adult Price (₹/day)</Label>
                <Input type="number" value={adultPrice} onChange={(e) => setAdultPrice(Number(e.target.value))} required />
              </div>
              <div className="space-y-2">
                <Label>Child Price (₹/day)</Label>
                <Input type="number" value={childPrice} onChange={(e) => setChildPrice(Number(e.target.value))} required />
              </div>
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
              <Button type="submit">Save Plan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
