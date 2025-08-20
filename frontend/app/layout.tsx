import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Books Shop - Discover Amazing Books",
  description: "A modern book management system built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
