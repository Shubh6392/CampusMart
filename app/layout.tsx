import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CampusMart',
  description: 'Campus-only marketplace for students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} text-slate-950 antialiased dark:text-slate-100 transition-colors duration-200`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
