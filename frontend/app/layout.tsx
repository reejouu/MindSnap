import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { CivicAuthProvider } from "@civic/auth/nextjs";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindSnap - AI-Powered Learning Cards",
  description:
    "Turn long content into AI-generated swipeable learning cards. Learn fast, stay curious.",
  keywords: ["learning", "AI", "flashcards", "education", "study"],
  authors: [{ name: "MindSnap Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-text`}
      >
        <Providers> <CivicAuthProvider>{children}</CivicAuthProvider></Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
