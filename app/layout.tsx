import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LaundryOS | Fresh Laundry Delivered to Your Doorstep",
  description:
    "Book express laundry pickup in 30 seconds. Professional fabric care, eco-steam washing, and live order tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              borderRadius: "1rem",
              fontFamily: "var(--font-inter), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}