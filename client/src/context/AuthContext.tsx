import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { apiRequest } from "@/lib/queryClient";
import fast2sms from "@/lib/fast2sms";
import { User } from "@shared/schema";

interface AuthContextType {
  isAuthenticated: boolean;
  userData: User | null;
  isLoading: boolean;
  error: string | null;
  
  sendOtpToPhone: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtpCode: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  completeUserRegistration: (userData: { name: string; phone: string; email?: string; address?: string }) => Promise<{ success: boolean; message: string }>;
  login: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userData: null,
  isLoading: true,
  error: null,
  
  sendOtpToPhone: async () => ({ success: false, message: "Not implemented" }),
  verifyOtpCode: async () => ({ success: false, message: "Not implemented" }),
  completeUserRegistration: async () => ({ success: false, message: "Not implemented" }),
  login: async () => ({ success: false, message: "Not implemented" }),
  logout: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        const data = await response.json();
        
        if (data.user) {
          setIsAuthenticated(true);
          setUserData(data.user);
        }
      } catch (err) {
        // Not authenticated, which is fine
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const sendOtpToPhone = async (phone: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const result = await fast2sms.sendOTP(phone, otp);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send OTP";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpCode = async (phone: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock OTP verification - in a real app, this would verify with the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Accept 4-digit OTP for demo purposes
      const isValid = otp.length === 4 && /^\d+$/.test(otp);
      
      if (isValid) {
        // Get or create user by phone
        const response = await apiRequest("POST", "/api/auth/verify-otp", { phone, otp });
        const data = await response.json();
        
        if (data.success && data.user) {
          setIsAuthenticated(true);
          setUserData(data.user);
        }
        
        return { success: isValid, message: isValid ? "OTP verified successfully" : "Invalid OTP", user: data.user };
      } else {
        return { success: false, message: "Invalid OTP format" };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to verify OTP";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const completeUserRegistration = async (userData: { name: string; phone: string; email?: string; address?: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call API to complete registration
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const data = await response.json();
      
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUserData(data.user);
        return { success: true, message: "Registration successful", userId: data.user.id };
      }
      
      return { success: false, message: data.message || "Registration failed" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete registration";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is essentially the same as verifyOtpCode for our implementation
      const result = await verifyOtpCode(phone, otp);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to login";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiRequest("POST", "/api/auth/logout");
      setIsAuthenticated(false);
      setUserData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to logout";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    userData,
    isLoading,
    error,
    sendOtpToPhone,
    verifyOtpCode,
    completeUserRegistration,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
