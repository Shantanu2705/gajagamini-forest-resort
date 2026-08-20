'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useHotelStore } from '@/lib/store/use-hotel-store';
import { formatCurrency } from '@/utils/formatters';
import { QrCode, Copy, Check, Building2, Smartphone } from 'lucide-react';

interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  referenceNo?: string;
  clientName?: string;
}

export const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  referenceNo,
  clientName,
}) => {
  const settings = useHotelStore((s) => s.settings);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const upiId = settings?.upiId || 'gajagamini@hdfc';
  const bankName = settings?.bankName || 'HDFC Bank';
  const accountName = settings?.accountName || 'Gajagamini Forest Resort';
  const accountNumber = settings?.accountNumber || '50200012345678';
  const ifsc = settings?.ifsc || 'HDFC0001234';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <QrCode className="h-6 w-6 text-primary" />
              Scan QR Code to Pay
            </DialogTitle>
            {settings?.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
            )}
          </div>
          <DialogDescription>
            Direct UPI & Bank Transfer Payment for {clientName || settings?.companyName || 'Gajagamini Resort'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {amount && amount > 0 ? (
            <div className="text-center">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount Due</span>
              <div className="text-3xl font-extrabold text-primary">{formatCurrency(amount)}</div>
              {referenceNo && <span className="text-xs text-muted-foreground">Ref: {referenceNo}</span>}
            </div>
          ) : null}

          {/* QR Code Photo Display */}
          <div className="relative flex h-56 w-56 items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-inner">
            {settings?.qrCodeUrl ? (
              <img
                src={settings.qrCodeUrl}
                alt="Payment QR Code"
                className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <QrCode className="h-24 w-24 text-primary/60 animate-pulse mb-2" />
                <span className="text-xs font-semibold text-primary">HOTEL UPI QR</span>
                <span className="text-[10px] text-muted-foreground mt-1">Scan via GPay, PhonePe, Paytm, or BHIM</span>
              </div>
            )}
          </div>

          <div className="w-full space-y-3 pt-2">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">UPI ID</div>
                  <div className="text-sm font-semibold">{upiId}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(upiId, 'upi')}
              >
                {copiedField === 'upi' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2 border-b pb-2 text-xs font-semibold text-muted-foreground uppercase">
                <Building2 className="h-4 w-4 text-primary" /> Bank Account Details
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Bank:</span> <strong className="block">{bankName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">IFSC Code:</span>{' '}
                  <strong className="block flex items-center justify-between">
                    {ifsc}
                    <button onClick={() => copyToClipboard(ifsc, 'ifsc')} className="text-primary hover:underline ml-1">
                      {copiedField === 'ifsc' ? 'Copied' : 'Copy'}
                    </button>
                  </strong>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Account Name:</span> <strong className="block">{accountName}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Account Number:</span>{' '}
                  <strong className="block flex items-center justify-between font-mono text-sm">
                    {accountNumber}
                    <button onClick={() => copyToClipboard(accountNumber, 'acc')} className="text-primary hover:underline ml-1 text-xs">
                      {copiedField === 'acc' ? 'Copied' : 'Copy Acc No.'}
                    </button>
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button type="button" variant="default" className="w-full font-semibold" onClick={onClose}>
            Done & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
