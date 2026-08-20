'use client';
import React from 'react';
import { createPortal } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Share2, Download } from 'lucide-react';
import { useHotelStore } from '@/lib/store/use-hotel-store';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentNo?: string;
  children: React.ReactNode;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  documentNo,
  children,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const settings = useHotelStore((state) => state.settings);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden no-print">
          <div className="flex items-center justify-between border-b bg-muted/40 px-6 py-4">
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <span>{title}</span>
                {documentNo && <span className="text-sm font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">{documentNo}</span>}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Formatted for standard A4 printing and PDF export
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 font-semibold">
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-900 flex justify-center">
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 shadow-xl rounded sm:p-12">
              {children}
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/40 px-6 py-3 sm:justify-end">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
            <Button variant="default" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {mounted && isOpen && typeof document !== 'undefined' && createPortal(
        <div id="global-print-area" className="hidden print:block print:w-full print:bg-white print:text-black print:m-0 print:overflow-visible print:z-[99999] static">
          
          {/* Fixed overlay for border and watermark that repeats on every printed page */}
          <div className="hidden print:flex fixed inset-0 z-0 items-center justify-center pointer-events-none">
             {/* Border */}
             <div className="absolute border-[3px] border-primary/30 pointer-events-none" style={{ top: '12px', bottom: '12px', left: '12px', right: '12px' }} />
             <div className="absolute border border-primary/60 pointer-events-none" style={{ top: '17px', bottom: '17px', left: '17px', right: '17px' }} />
             {/* Watermark Logo */}
             {settings?.logoUrl && (
               <img 
                 src={settings.logoUrl} 
                 alt="Watermark" 
                 className="pointer-events-none drop-shadow-sm"
                 style={{ 
                   maxWidth: '75%', 
                   maxHeight: '75%', 
                   opacity: 0.12,
                 }}
               />
             )}
          </div>

          <table className="relative z-10 w-full mx-auto max-w-[210mm]" style={{ boxSizing: 'border-box' }}>
            <thead>
              <tr>
                <td style={{ height: '40px' }}></td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0 40px' }}>
                  {children}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td style={{ height: '40px' }}></td>
              </tr>
            </tfoot>
          </table>
        </div>,
        document.body
      )}
    </>
  );
};
