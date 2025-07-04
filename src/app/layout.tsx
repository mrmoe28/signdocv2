import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp, isStackAuthAvailable } from "../stack";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
// import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Job Invoicer",
  description: "Professional invoice management system",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if Stack Auth is configured
  const stackAuthEnabled = isStackAuthAvailable();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {stackAuthEnabled && stackServerApp ? (
          <StackProvider app={stackServerApp}>
            <StackTheme>
              <ToastProvider>
                {children}
              </ToastProvider>
            </StackTheme>
          </StackProvider>
        ) : (
          // Fallback when Stack Auth is not configured
          <ToastProvider>
            {children}
          </ToastProvider>
        )}
      </body>
    </html>
  );
}
