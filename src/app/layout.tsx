import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MotionProvider } from "@/components/MotionProvider";

export const metadata: Metadata = {
  title: "Molarè | Refined Clothing",
  description: "Luxury Italian sartorial fashion for a modern wardrobe."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <MotionProvider>
              <main>{children}</main>
            </MotionProvider>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
