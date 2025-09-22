import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import Inter from next/font/google
import "./globals.css";
import { NextAuthProvider } from "@/components/auth/NextAuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navigation/Navbar";
import { Toaster } from "@/components/ui/sonner";

// 2. Initialize the Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // 3. Use a standard variable name
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
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}