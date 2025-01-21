"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle"
import { useAuthContext } from "@/app/context/useAuth";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export function NavBar() {
  const { authLoading, auth_logout, isLoggedIn } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  // Read userData from localStorage on component mount and when it changes
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserData(data);
  }, [isLoggedIn]); // Re-run when isLoggedIn changes

  const navItems = [
    { href: `/${userData?.username}`, label: "My Profile" },
    { href: "/new-post", label: "New Post" },
    { href: "/search-friends", label: "Search Friends" },
  ];

  const handleLogout = async () => {
    await auth_logout();
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            SocialApp
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary text-primary"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-sm font-medium transition-colors hover:text-primary text-primary"
            >
              Logout
            </button>
          </div>
          <div className="flex items-center space-x-4">
          <ThemeToggle />
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              Logout
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}