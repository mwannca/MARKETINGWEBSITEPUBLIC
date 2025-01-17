import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import 'typeface-open-sans';
import React from "react";
import Footer from "@/app/Footer";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Mail Spark App",
    description: "Effortlessly create Beautiful Emails in Minutes",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="">
        <Toaster position="top-center" />
        <body className={inter.className}>
        {children}
        </body>
        </html>
    );
}
