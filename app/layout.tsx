import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import ReduxProvider from "@/components/Providers/ReduxProvider";
import QueryProvider from "@/components/Providers/QueryProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "@/components/Providers/AuthProvider";
import { Header } from "@/components/ui/Header";
import ChatBot from "@/presentations/ChatBot";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BOOK.ME | Premium Minimalist Event Booking",
  description: "A high-end, minimalist booking platform designed for seamless event management and elite client experiences.",
  keywords: ["event booking", "minimalist design", "premium scheduling", "booking management", "OrbitNest"],
  authors: [{ name: "OrbitNest Team" }],
  creator: "OrbitNest",
  publisher: "OrbitNest",
  metadataBase: new URL("https://book-me-event.vercel.app"), // Replace with actual domain when ready
  openGraph: {
    title: "BOOK.ME | Premium Minimalist Event Booking",
    description: "Experience the next level of event booking with our minimalist, reliable, and powerful platform.",
    url: "/",
    siteName: "BOOK.ME",
    images: [
      {
        url: "/icons/favicon-512x512.png",
        width: 512,
        height: 512,
        alt: "BOOK.ME Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOOK.ME | Minimalist Event Booking",
    description: "A premium minimalist booking experience for elite events.",
    images: ["/icons/favicon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/favicon.ico" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/apple-touch-icon-114x114.png", sizes: "114x114", type: "image/png" },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <ReduxProvider>
            <QueryProvider>
              <TooltipProvider>
                <Header />
                {children}
                <ChatBot />
              </TooltipProvider>
            </QueryProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
