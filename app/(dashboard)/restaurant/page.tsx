'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useRestaurantStore } from '@/lib/store/use-restaurant-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Edit, Trash2, FileText, Utensils } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { PdfPreviewModal } from '@/components/shared/pdf-preview-modal';
import { RestaurantBillPdfTemplate } from '@/components/pdf/restaurant-bill-template';
import { RestaurantBill } from '@/types';

export default function RestaurantBillsHub() {
  const router = useRouter();
  const { bills, deleteBill, fetchAll, isLoading, settings } = useRestaurantStore();
  
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [searchTerm, setSearchTerm] = useState('');
  const [previewBill, setPreviewBill] = useState<RestaurantBill | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      await deleteBill(id);
    }
  };

  const filtered = bills.filter(b => 
    b.billNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.guestName && b.guestName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.tableNo && b.tableNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            Restaurant Bills
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage restaurant orders and generate bills.</p>
        </div>
        <Button onClick={() => router.push('/restaurant/new')} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Bill
        </Button>
      </div>

      <Card className="p-4 shadow-soft">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by Bill No, Name or Table..."
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
                <TableHead>Bill No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guest/Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading bills...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No restaurant bills found</TableCell></TableRow>
              ) : (
                filtered.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium text-gray-900">{bill.billNo}</TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(bill.date)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      <div>{bill.guestName || 'Walk-in'}</div>
                      <div className="text-xs text-gray-400">
                        {bill.tableNo ? `Table: ${bill.tableNo}` : ''} 
                        {bill.tableNo && bill.roomNo ? ' | ' : ''}
                        {bill.roomNo ? `Room: ${bill.roomNo}` : ''}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {bill.items.length} items
                    </TableCell>
                    <TableCell className="font-semibold text-primary">{formatCurrency(bill.grandTotal)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPreviewBill(bill)}>
                          <FileText className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(bill.id)}>
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
      
      {previewBill && (
        <PdfPreviewModal
          isOpen={!!previewBill}
          onClose={() => setPreviewBill(null)}
          title={`Restaurant Bill - ${previewBill.billNo}`}
          documentNo={previewBill.billNo}
        >
          <RestaurantBillPdfTemplate bill={previewBill} settings={settings || null} />
        </PdfPreviewModal>
      )}
    </DashboardLayout>
  );
}
