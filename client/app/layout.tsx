import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "../components/ui/navbar";
import Sidebar from "../components/ui/sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mini SIS Admin",
  description: "Admin dashboard for Mini School Information System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
          <Navbar />
          <div className="container py-10">
            <div className="flex gap-8">
              <Sidebar />
              <main className="min-h-[70vh] w-full">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
