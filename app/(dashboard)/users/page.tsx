'use client';
import React, { useState, Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuthStore } from '@/lib/store/use-auth-store';
import { User, UserRole } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/utils/formatters';
import {
  Users,
  PlusCircle,
  Search,
  Trash2,
  Shield,
  UserCheck,
  Lock,
} from 'lucide-react';

function UsersHubContent() {
  const { user: currentUser, usersList, addUser, deleteUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [password, setPassword] = useState('Welcome@2026');

  const isAdmin = currentUser?.role === 'admin';

  const openNewModal = () => {
    setEmail('');
    setName('');
    setRole('operator');
    setPassword('Welcome@2026');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);
    setIsModalOpen(false);
  };

  const filtered = usersList.filter((u) =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Role Access Control</h1>
          <p className="text-sm text-muted-foreground">
            Manage admin credentials, booking operators, and branch managers with RBAC permissions.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openNewModal} className="bg-primary text-primary-foreground font-semibold shadow-sm">
            <PlusCircle className="mr-1.5 h-4 w-4" /> Create User Account
          </Button>
        )}
      </div>

      {!isAdmin && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-800 dark:text-amber-300 flex items-center gap-3">
          <Lock className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold">
            You are logged in as <strong>{currentUser?.role?.toUpperCase()}</strong>. Only Administrator accounts can create or remove staff credentials.
          </span>
        </Card>
      )}

      <Card className="p-4 shadow-soft">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name & Avatar</TableHead>
              <TableHead>Email Address (Login ID)</TableHead>
              <TableHead>Assigned RBAC Role</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Created Date</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((usr) => (
              <TableRow key={usr.id}>
                <TableCell className="font-semibold">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                      {usr.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{usr.name}</div>
                      {usr.id === currentUser?.id && (
                        <span className="text-[10px] text-primary font-extrabold">(You)</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{usr.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                    usr.role === 'admin'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                      : usr.role === 'manager'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    <Shield className="h-3 w-3" /> {usr.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <UserCheck className="h-3.5 w-3.5" /> Active
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">
                  {formatDate(usr.createdAt || new Date().toISOString())}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    {usr.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteUser(usr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Register Staff Account
            </DialogTitle>
            <DialogDescription>
              Assign operator or manager privileges for software access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Staff Full Name *</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amit Chhetri" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email (Login ID) *</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. amit@gajagamini.com" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role & Access</Label>
                <Select value={role} onValueChange={(r) => setRole(r as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Operator (Bookings & Quotes)</SelectItem>
                    <SelectItem value="manager">Manager (Full Operational)</SelectItem>
                    <SelectItem value="admin">Administrator (All Rights)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Initial Password</Label>
                <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="font-mono" />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground font-semibold">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-8 text-center font-bold">Loading Staff Directory...</div>}>
        <UsersHubContent />
      </Suspense>
    </DashboardLayout>
  );
}
