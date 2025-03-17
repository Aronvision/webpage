import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: '공항 모빌리티 서비스',
  description: '공항 내 이동을 위한 안전하고 빠른 모빌리티 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
