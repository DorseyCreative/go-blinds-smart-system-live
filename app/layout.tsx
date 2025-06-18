import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Go Blinds Smart System",
  description: "Automated workflow for Go Blinds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        <nav className="p-4 border-b border-gray-200 mb-8 bg-gray-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="font-bold text-lg">
              <Link href="/">Go Blinds Smart System</Link>
            </div>
            <div>
              <Link href="/admin/alerts" className="text-gray-600 hover:text-gray-900 mr-4">Alerts</Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900 mr-4">Orders</Link>
              <Link href="/admin/settings/calendar" className="text-gray-600 hover:text-gray-900">Settings</Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4">{children}</main>
      </body>
    </html>
  );
} 