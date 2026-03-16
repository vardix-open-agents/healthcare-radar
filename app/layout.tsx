import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import DataProvider from '@/components/DataProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Healthcare Radar - Varden',
  description: 'Healthcare opportunities and market intelligence for the Varden team',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-900 text-zinc-100 antialiased`}>
        <DataProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-zinc-800 py-6 px-4 text-center text-zinc-500 text-sm">
              <p>Healthcare Radar • Varden Team • Built with Next.js</p>
            </footer>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
