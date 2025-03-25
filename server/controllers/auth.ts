import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { generateOTP, sendOTPViaSMS } from "../services/fast2sms";
import { OTP_LENGTH, OTP_EXPIRES_IN_MINUTES } from "@shared/constants";

// Define validation schemas
const sendOTPSchema = z.object({
  phone: z.string().min(10).max(10),
});

const verifyOTPSchema = z.object({
  phone: z.string().min(10).max(10),
  otp: z.string().length(OTP_LENGTH),
});

const authController = {
  /**
   * Send OTP to user's phone number
   */
  sendOTP: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = sendOTPSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
      }

      const { phone } = result.data;

      // Generate a new OTP
      const otp = generateOTP(OTP_LENGTH);
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRES_IN_MINUTES);
      
      // Save OTP in storage
      await storage.saveOTP({
        phone,
        otp,
        expiresAt,
        createdAt: new Date(),
      });
      
      // Send OTP via SMS service
      const isSent = await sendOTPViaSMS(phone, otp);
      
      if (!isSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }
  },

  /**
   * Verify OTP and authenticate user
   */
  verifyOTP: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = verifyOTPSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP or phone number format",
        });
      }

      const { phone, otp } = result.data;
      
      // Get the saved OTP
      const savedOTP = await storage.getOTPByPhone(phone);
      
      if (!savedOTP) {
        return res.status(400).json({
          success: false,
          message: "No OTP found for this phone number",
        });
      }
      
      // Check if OTP has expired
      if (new Date() > savedOTP.expiresAt) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new OTP",
        });
      }
      
      // Verify OTP
      if (savedOTP.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP. Please try again",
        });
      }
      
      // OTP is valid, find or create user
      let user = await storage.getUserByPhone(phone);
      
      if (!user) {
        // Create a new user
        user = await storage.createUser({
          username: `user_${phone.substring(phone.length - 4)}`,
          phone,
          password: "", // No password for OTP authentication
          name: "",
          email: "",
          address: "",
          role: "customer", // Default role is customer
          createdAt: new Date(),
        });
      }
      
      // Delete verified OTP
      await storage.deleteOTP(savedOTP.id);
      
      // Generate a JWT token or session
      const token = `token_${user.id}_${Date.now()}`;
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
      }
      
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        user,
        token,
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify OTP. Please try again.",
      });
    }
  },

  /**
   * Logout user by clearing session
   */
  logout: async (req: Request, res: Response) => {
    try {
      // Clear session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Failed to logout. Please try again.",
            });
          }
          
          res.clearCookie("connect.sid");
          
          return res.status(200).json({
            success: true,
            message: "Logged out successfully",
          });
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Logged out successfully",
        });
      }
    } catch (error) {
      console.error("Error logging out:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to logout. Please try again.",
      });
    }
  },
};

export default authController;
