'use client';

import Link from 'next/link';
import { useState } from 'react';
import Cookies from 'js-cookie'; // Use js-cookie for cookie management
import { useAuthContext } from '@/app/context/useAuth';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function NavBar() {
  const { authLoading, auth_logout } = useAuthContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Check localStorage for username
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const navItems = [
    { href: `/${userData.username}`, label: 'My Profile' },
    { href: '/new-post', label: 'New Post' },
    { href: '/search-friends', label: 'Search Friends' },
  ];

  const handleLogout = async () => {
    try {
      // Remove tokens from cookies
      Cookies.remove('access_token', { path: '/' });
      Cookies.remove('refresh_token', { path: '/' });
      localStorage.removeItem('userData');
      await auth_logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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