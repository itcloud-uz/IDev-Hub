import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'iDev-Hub | Dasturchilar uchun marketplace',
  description:
    "iDev-Hub — dasturchilar uchun premium marketplace. Server vositalari, AI botlar, web dasturlash va DevOps mahsulotlarini toping.",
  keywords: ['dasturchilar', 'marketplace', 'developer tools', 'iDev-Hub'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="bg-bg-primary text-text-primary font-body antialiased min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1A1A25',
                color: '#F0EDE6',
                border: '1px solid #2A2A35',
                borderRadius: '8px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#C9A84C',
                  secondary: '#0A0A0F',
                },
              },
              error: {
                iconTheme: {
                  primary: '#F87171',
                  secondary: '#0A0A0F',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
