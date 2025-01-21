"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/app/context/useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const router = useRouter();
  const { authLoading, isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      console.log("Redirecting to login...");
      router.replace("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};

export default PrivateRoute;