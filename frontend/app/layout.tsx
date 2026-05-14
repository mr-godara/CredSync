import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "CredSync — Loan Management System",
  description: "A modern loan management platform for borrowers and operations teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFCF7",
              border: "1px solid #E2D2BE",
              color: "#1B1A16",
              fontFamily: "Manrope, system-ui, sans-serif",
              fontSize: "14px",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(27,26,22,0.10)",
            },
            classNames: {
              success: "!border-l-4 !border-l-[#2F6B4F]",
              error:   "!border-l-4 !border-l-[#B42318]",
              warning: "!border-l-4 !border-l-[#8E5A22]",
              info:    "!border-l-4 !border-l-[#C08B2D]",
            },
          }}
        />
      </body>
    </html>
  );
}

