import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { User, DecodedToken } from "@/types/userTypes";
import { useRouter } from "next/router";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Decode token and set user on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);

        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          // Token expired, clear it
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        } else {
          // Token valid, set user data
          setToken(storedToken);
          setUser({
            _id: decoded._id,
            email: decoded.email,
            role: decoded.role,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            isActive: decoded.isActive,
            isEmailVerified: true, // Assumed from JWT
            requiresProfileCompletion: decoded.requiresProfileCompletion,
          });
        }
      } catch (error) {
        // Invalid token, clear it
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);

      // Store token
      localStorage.setItem("token", newToken);
      setToken(newToken);

      // Set user from decoded token
      setUser({
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isActive: decoded.isActive,
        isEmailVerified: true,
        requiresProfileCompletion: decoded.requiresProfileCompletion,
      });
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
