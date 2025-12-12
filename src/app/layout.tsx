// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/shared/AnimatedBackground";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SST Services - Sistema de Gestión",
  description:
    "Plataforma de gestión de servicios de Seguridad y Salud en el Trabajo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <AnimatedBackground />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
