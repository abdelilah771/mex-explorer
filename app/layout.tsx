import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/auth/NextAuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navigation/Navbar";
import { Toaster } from "@/components/ui/sonner"; // 1. Import the new Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MEX - Marrakech Explorer",
  description: "Your AI-powered guide to Marrakech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster /> {/* 2. Add the new Toaster here */}
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}