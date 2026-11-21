import React, { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PizzaHub — Artisan Pizza Ordering & Delivery Platform",
  description:
    "Discover local pizzerias, browse mouthwatering wood-fired menus, and order freshly hand-stretched pizza straight to your door.",
  keywords: ["pizza", "delivery", "food order", "pizzahub", "artisan pizza", "restaurant marketplace"],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf7f2] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <Suspense fallback={<div className="h-20 bg-white/80 dark:bg-stone-900/80" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 flex flex-col">{children}</main>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
