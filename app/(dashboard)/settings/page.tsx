'use client';
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { CompanySettings } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { updateCredentials } from '@/lib/firebase/auth';
import { Upload, Trash2 } from 'lucide-react';

function SettingsContent() {
  const { settings, updateSettings } = useHotelStore();
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [companyName, setCompanyName] = useState('Gajagamini Forest Resort');
  const [supportEmail, setSupportEmail] = useState('gajagaminilataguri@gmail.com');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 9830712000');
  const [invoicePrefix, setInvoicePrefix] = useState('GFR');
  const [gstPercent, setGstPercent] = useState('5');
  
  // Logos
  const [logoUrl, setLogoUrl] = useState('');
  const [headerLogoUrl, setHeaderLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  
  // Terms
  const [terms, setTerms] = useState('');
  
  // Bank
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountName, setAccountName] = useState('Gajagamini Forest Resort');
  const [accountNumber, setAccountNumber] = useState('30000000000');
  const [ifsc, setIfsc] = useState('SBIN0000000');
  const [branch, setBranch] = useState('Lataguri');
  const [upiId, setUpiId] = useState('gajagamini@sbi');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  // Credentials
  const [adminFullName, setAdminFullName] = useState('Rajiv Pradhan');
  const [adminEmail, setAdminEmail] = useState('admin@gajagamini.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  useEffect(() => {
    if (settings) {
      if (settings.companyName) setCompanyName(settings.companyName);
      if (settings.supportEmail) setSupportEmail(settings.supportEmail);
      if (settings.email && !settings.supportEmail) setSupportEmail(settings.email);
      if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
      if (settings.invoicePrefix) setInvoicePrefix(settings.invoicePrefix);
      if (settings.gstPercent !== undefined) setGstPercent(settings.gstPercent.toString());
      if (settings.logoUrl) setLogoUrl(settings.logoUrl);
      if (settings.headerLogoUrl) setHeaderLogoUrl(settings.headerLogoUrl);
      if (settings.footerLogoUrl) setFooterLogoUrl(settings.footerLogoUrl);
      if (settings.termsAndConditions) setTerms(settings.termsAndConditions);
      if (settings.bankName) setBankName(settings.bankName);
      if (settings.accountName) setAccountName(settings.accountName);
      if (settings.accountNumber) setAccountNumber(settings.accountNumber);
      if (settings.ifsc) setIfsc(settings.ifsc);
      if (settings.branch) setBranch(settings.branch);
      if (settings.upiId) setUpiId(settings.upiId);
      if (settings.qrCodeUrl) setQrCodeUrl(settings.qrCodeUrl);
      if (settings.adminFullName) setAdminFullName(settings.adminFullName);
      if (settings.adminEmail) setAdminEmail(settings.adminEmail);
    }
  }, [settings]);

  const handleSaveAll = async () => {
    setLoading(true);
    const updated: CompanySettings = {
      ...settings,
      companyName,
      supportEmail,
      email: supportEmail,
      whatsappNumber,
      invoicePrefix,
      gstPercent: Number(gstPercent),
      logoUrl,
      headerLogoUrl,
      footerLogoUrl,
      termsAndConditions: terms,
      bankName,
      accountName,
      accountNumber,
      ifsc,
      branch,
      upiId,
      qrCodeUrl,
      adminFullName,
      adminEmail,
    };
    await updateSettings(updated);
    setLoading(false);
    alert('Settings saved successfully!');
  };

  const handleUpdateAuth = async () => {
    setAuthMsg('');
    if (newPassword && newPassword !== confirmPassword) {
      setAuthMsg('New passwords do not match');
      return;
    }
    if (!currentPassword) {
      setAuthMsg('Current password is required to update credentials');
      return;
    }
    try {
      await updateCredentials(adminEmail, currentPassword, newPassword || undefined);
      // Also save name to settings
      await updateSettings({ ...settings, adminFullName, adminEmail });
      setAuthMsg('Credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setAuthMsg(e.message);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQr = () => {
    if (upiId) {
      const autoUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(companyName)}&cu=INR`;
      setQrCodeUrl(autoUrl);
    }
  };

  return (
    <div className="min-h-screen bg-[#effdf5] pb-24">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-[14px] text-gray-500">Manage company details, invoicing, and preferences.</p>
        </div>

        {/* 1. Company profile */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6">Company profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Company name</Label>
              <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Support email</Label>
              <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">WhatsApp number</Label>
              <Input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Invoice prefix</Label>
              <Input value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">GST %</Label>
              <Input value={gstPercent} onChange={e => setGstPercent(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Company logo</Label>
              <div className="flex items-center gap-4 p-2 border border-dashed border-gray-300 rounded-xl">
                <div className="w-16 h-10 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                  {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" alt="logo" /> : <span className="text-[10px] text-gray-400">No logo</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-[13px] text-gray-600 font-medium cursor-pointer hover:text-gray-900 transition-colors">
                    Change logo
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, setLogoUrl)} />
                  </Label>
                  {logoUrl && (
                    <Button onClick={() => setLogoUrl('')} variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PDF logos */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">PDF logos</h2>
          <p className="text-[13px] text-gray-500 mb-6">Header logo appears at the top of every quotation & invoice. Footer logo appears at the bottom. Leave blank to use the default Gajagamini logos.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[12px] text-gray-700 font-medium">Header logo (top of PDF)</Label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-16 border border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50/50 overflow-hidden">
                  {headerLogoUrl ? <img src={headerLogoUrl} className="w-full h-full object-contain" alt="header" /> : <span className="text-[11px] text-gray-400">Default</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="h-9 px-4 rounded-full border border-gray-200 flex items-center justify-center gap-2 text-[12px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-50">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, setHeaderLogoUrl)} />
                  </Label>
                  {headerLogoUrl && (
                    <Button onClick={() => setHeaderLogoUrl('')} variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-200">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[12px] text-gray-700 font-medium">Footer logo (bottom of PDF)</Label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-16 border border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50/50 overflow-hidden">
                  {footerLogoUrl ? <img src={footerLogoUrl} className="w-full h-full object-contain" alt="footer" /> : <span className="text-[11px] text-gray-400">Default</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="h-9 px-4 rounded-full border border-gray-200 flex items-center justify-center gap-2 text-[12px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-50">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, setFooterLogoUrl)} />
                  </Label>
                  {footerLogoUrl && (
                    <Button onClick={() => setFooterLogoUrl('')} variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 border-gray-200">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Terms & conditions */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6">Terms & conditions</h2>
          <Textarea 
            value={terms} 
            onChange={e => setTerms(e.target.value)} 
            className="min-h-[120px] rounded-xl border-gray-200 text-[13px] resize-y p-4 text-gray-700 shadow-none focus-visible:ring-1" 
          />
        </div>

        {/* 4. Bank details & payment QR */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">Bank details & payment QR</h2>
          <p className="text-[13px] text-gray-500 mb-6">Shown on every quotation PDF to help customers pay quickly.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Bank name</Label>
              <Input value={bankName} onChange={e => setBankName(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Account holder name</Label>
              <Input value={accountName} onChange={e => setAccountName(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Account number</Label>
              <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">IFSC</Label>
              <Input value={ifsc} onChange={e => setIfsc(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Branch</Label>
              <Input value={branch} onChange={e => setBranch(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">UPI ID</Label>
              <Input value={upiId} onChange={e => setUpiId(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label className="text-[12px] text-gray-700 font-medium">Payment QR code</Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 border border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50/50 overflow-hidden">
                  {qrCodeUrl ? <img src={qrCodeUrl} className="w-full h-full object-contain p-2" alt="qr" /> : <span className="text-[11px] text-gray-400">No QR</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="h-9 px-4 rounded-full border border-gray-200 flex items-center justify-center gap-2 text-[12px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 w-fit">
                    <Upload className="w-3.5 h-3.5" /> Upload QR image
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, setQrCodeUrl)} />
                  </Label>
                  <Button onClick={generateQr} variant="secondary" size="sm" className="h-9 rounded-full px-4 text-[12px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 w-fit">
                    Generate from UPI ID
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Login credentials */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-[15px] font-bold text-gray-900 mb-1">Login credentials</h2>
          <p className="text-[13px] text-gray-500 mb-6">Update your sign-in email and password. Leave password fields blank to keep the current password.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Full name</Label>
              <Input value={adminFullName} onChange={e => setAdminFullName(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Login email</Label>
              <Input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[12px] text-gray-600 font-medium">Current password</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px] md:max-w-md" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">New password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-gray-600 font-medium">Confirm new password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-10 rounded-xl border-gray-200 text-[14px]" />
            </div>
            
            <div className="md:col-span-2 flex flex-col items-end gap-3 mt-2">
              {authMsg && <p className="text-[13px] font-medium text-amber-600">{authMsg}</p>}
              <Button onClick={handleUpdateAuth} className="h-10 rounded-full px-6 font-bold text-[14px] bg-yellow-400 text-yellow-950 hover:bg-yellow-500 shadow-none border-0">
                Update login details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Save */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button onClick={handleSaveAll} disabled={loading} className="h-12 rounded-full px-8 shadow-lg font-bold text-[14px] bg-yellow-400 text-yellow-950 hover:bg-yellow-500 border-0 transition-transform hover:scale-105">
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-8 text-center font-bold">Loading Company Settings...</div>}>
        <SettingsContent />
      </Suspense>
    </DashboardLayout>
  );
}
