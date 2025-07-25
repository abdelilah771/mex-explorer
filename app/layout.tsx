import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/auth/NextAuthProvider";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider"; // 1. Import ThemeProvider
import Navbar from "@/components/navigation/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
            <Toaster position="top-center" />
            <Navbar />
            <main>{children}</main>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}