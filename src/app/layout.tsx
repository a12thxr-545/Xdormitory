import type { Metadata } from 'next';
import { Prompt, Inter } from 'next/font/google';
import './globals.css';

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-prompt',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Xdormitory - ระบบจองหอพักออนไลน์ (Dormitory Booking System)',
  description: 'ระบบจองหอพักออนไลน์ ค้นหาห้องว่าง จองทันที ป้องกันการจองซ้ำ พร้อมระบบจัดการสำหรับเจ้าของหอพัก',
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${prompt.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
