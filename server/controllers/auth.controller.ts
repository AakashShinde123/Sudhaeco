import { Request, Response } from "express";
import { storage } from "../storage";
import { phoneSchema, otpSchema } from "@shared/schema";
import { sendSMS } from "../services/fast2sms.service";

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to phone number
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    const phoneResult = phoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Please enter a 10-digit number."
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    
    // OTP expiry time (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Store OTP in database
    await storage.createOtp({
      phone,
      code: otpCode,
      expiresAt,
    });

    // In production, send SMS with OTP
    // For development, just return OTP in response
    try {
      // Uncomment in production with valid API key
      // await sendSMS(phone, `Your Speedy verification code is: ${otpCode}. It expires in 10 minutes.`);
      
      console.log(`OTP for ${phone}: ${otpCode}`);
      
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        // In development mode, we'll return the OTP for easier testing
        ...(process.env.NODE_ENV !== "production" && { otp: otpCode })
      });
    } catch (error) {
      console.error("SMS sending error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP SMS. Please try again."
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    // Validate phone number and OTP
    const phoneResult = phoneSchema.safeParse(phone);
    const otpResult = otpSchema.safeParse(otp);
    
    if (!phoneResult.success || !otpResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number or OTP format"
      });
    }

    // Verify OTP
    const isValid = await storage.verifyOtp(phone, otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByPhone(phone);
    const isNewUser = !existingUser;

    // Generate session
    if (existingUser) {
      // Set user in session
      (req.session as any).userId = existingUser.id;
      (req.session as any).userRole = existingUser.role;
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      isNewUser,
      userId: existingUser?.id
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Complete registration after OTP verification
export const register = async (req: Request, res: Response) => {
  try {
    const { phone, name, email, address } = req.body;

    // Validate phone number
    const phoneResult = phoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format"
      });
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name is required and must be at least 2 characters"
      });
    }

    // Check if OTP was verified for this phone
    const latestOtp = await storage.getOtpByPhone(phone);
    if (!latestOtp || !latestOtp.verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number with OTP first"
      });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByPhone(phone);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists"
      });
    }

    // Create new user
    const newUser = await storage.createUser({
      phone,
      name,
      email,
      address,
      role: "customer",
      isVerified: true
    });

    // Set user in session
    (req.session as any).userId = newUser.id;
    (req.session as any).userRole = newUser.role;

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: newUser.id
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Login with OTP
export const login = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    // Validate phone number and OTP
    const phoneResult = phoneSchema.safeParse(phone);
    const otpResult = otpSchema.safeParse(otp);
    
    if (!phoneResult.success || !otpResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number or OTP format"
      });
    }

    // Verify OTP
    const isValid = await storage.verifyOtp(phone, otp);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Check if user exists
    const user = await storage.getUserByPhone(phone);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first"
      });
    }

    // Set user in session
    (req.session as any).userId = user.id;
    (req.session as any).userRole = user.role;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Logout
export const logout = (req: Request, res: Response) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to logout"
      });
    }
    
    res.clearCookie('connect.sid');
    
    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      // Clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
