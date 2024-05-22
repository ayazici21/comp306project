import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'primereact/resources/themes/lara-dark-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import "primeflex/primeflex.min.css"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COMP 306",
  description: "Accounting project for COMP 306 course.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
