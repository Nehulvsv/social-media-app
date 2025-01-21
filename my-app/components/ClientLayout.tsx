"use client"; // Mark this file as a Client Component

import { usePathname } from "next/navigation";
import PrivateRoute from "@/components/PrivateRoute";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Now this works because the file is a Client Component

  // List of public routes
  const publicRoutes = ["/login", "/register"];

  // Function to check if a route is public
  const isPublicRoute = (pathname: string) => {
    return publicRoutes.includes(pathname);
  };

  return (
    <>
      {/* Conditionally wrap children with PrivateRoute */}
      {isPublicRoute(pathname) ? (
        // Render public routes directly
        children
      ) : (
        // Wrap private routes with PrivateRoute
        <PrivateRoute>{children}</PrivateRoute>
      )}
    </>
  );
}