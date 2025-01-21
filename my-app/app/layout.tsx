import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "../app/context/useAuth";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Media App",
  description: "A simple social media application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NavBar /> {/* Always render NavBar, whether logged in or not */}
          <main className="min-h-screen bg-gray-50">
            {/* Use ClientLayout to handle client-side logic */}
            {/* <ClientLayout> */}
              {children}
              {/* </ClientLayout> */}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}