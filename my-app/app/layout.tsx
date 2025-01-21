import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "../app/context/useAuth";
import ClientLayout from "@/components/ClientLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
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
            <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <ThemeProvider>
            <NavBar /> {/* Always render NavBar, whether logged in or not */}
            <main className="min-h-screen">
              {/* Use ClientLayout to handle client-side logic */}
              {/* <ClientLayout> */}
              {children}
              {/* </ClientLayout> */}
            </main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
