"use client";
import { get_auth, login, logout } from "@/utils/api";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean;
  authLoading: boolean;
  auth_login: (username: string, password: string) => Promise<void>;
  auth_logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  authLoading: true,
  auth_login: async () => {},
  auth_logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const auth_login = async (username: string, password: string) => {
    try {
      const success = await login(username, password);
      if (success) {
        setIsLoggedIn(true);
        const userData = {
          username: success.user.username,
          bio: success.user.bio,
          email: success.user.email,
          first_name: success.user.first_name,
          last_name: success.user.last_name,
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        router.push(`/${username}`);
      } else {
        setIsLoggedIn(false);
        alert("Invalid username or password");
      }
    } catch (err) {
      setIsLoggedIn(false);
      alert("An error occurred. Please try again.");
    }
  };

  const auth_logout = async () => {
    try {
      const success = await logout();
      if (success) {
        setIsLoggedIn(false); // Corrected to false
        localStorage.removeItem("userData"); // Clear localStorage on logout
        router.push("/login");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const check_auth = async () => {
    try {
      const res = await get_auth();
      if (res) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log(error);
      setIsLoggedIn(false);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    check_auth();
  }, []); // Run only on mount

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, authLoading, auth_login, auth_logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);