"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@/lib/user-context';
import { UserMenu } from '@/components/ui/user-menu';
import Link from 'next/link';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Create a QueryClient instance only once
  const [queryClient] = useState(() => new QueryClient());
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <nav className="w-full flex items-center justify-between px-6 py-3 border-b sticky top-0 z-50 bg-gradient-to-r from-pink-100 via-blue-100 to-purple-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 shadow-md">
              <div className="flex items-center gap-2">
                <img src="/globe.svg" alt="Globe" className="w-7 h-7 drop-shadow-md" />
                <Link href="/" className="font-extrabold text-xl tracking-tight text-fuchsia-700 dark:text-fuchsia-300 hover:underline">
                  News Aggregator
                </Link>
              </div>
              <UserMenu />
            </nav>
            <main className="max-w-2xl mx-auto px-4 py-8">
              {children}
            </main>
          </UserProvider>
        </QueryClientProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
