import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Gajagamini Forest Resort — Hotel & Quotation Management',
    template: '%s | Gajagamini Forest Resort',
  },
  description:
    'Enterprise-grade hotel management, room booking, automated billing, and quotation portal for Gajagamini Forest Resort.',
  keywords: [
    'Hotel Management',
    'Room Booking',
    'Resort ERP',
    'Quotation Builder',
    'Billing Apps',
  ],
  authors: [{ name: 'Gajagamini Forest Resort' }],
  openGraph: {
    title: 'Gajagamini Forest Resort Portal',
    description: '100% production-ready hotel and quotation system.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}
