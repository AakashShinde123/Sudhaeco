import { apiRequest } from "./queryClient";
import { User, OTPVerification } from "@shared/schema";

// OTP authentication service
export const authService = {
  // Send OTP
  async sendOTP(phone: string): Promise<{ message: string; phone: string }> {
    const response = await apiRequest("POST", "/api/auth/send-otp", { phone });
    return response.json();
  },

  // Verify OTP
  async verifyOTP(data: OTPVerification): Promise<{ message: string; user: User }> {
    const response = await apiRequest("POST", "/api/auth/verify-otp", data);
    return response.json();
  },

  // Update user profile
  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await apiRequest("PATCH", `/api/users/${userId}`, data);
    return response.json();
  },

  // Get user profile
  async getProfile(userId: number): Promise<User> {
    const response = await apiRequest("GET", `/api/users/${userId}`);
    return response.json();
  }
};
