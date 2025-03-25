/**
 * This is a simple wrapper around the Fast2SMS API
 * In a real application, this would interact with the actual Fast2SMS API
 * For development purposes, we're mocking the API calls
 */

interface Fast2SMSConfig {
  apiKey: string;
  sender?: string;
}

interface SendOTPResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

class Fast2SMSClient {
  private apiKey: string;
  private sender: string;
  private baseUrl: string = "https://www.fast2sms.com/dev/bulkV2";
  
  constructor(config: Fast2SMSConfig) {
    this.apiKey = config.apiKey || process.env.FAST2SMS_API_KEY || "";
    this.sender = config.sender || "TGRCRY"; // Default sender ID for Turbo Groceries
    
    if (!this.apiKey) {
      console.warn("Fast2SMS API key not provided. OTP functionality will be mocked.");
    }
  }
  
  /**
   * Send OTP via SMS
   * @param phone Phone number to send OTP to
   * @param otp OTP code
   * @returns Promise with the response
   */
  async sendOTP(phone: string, otp: string): Promise<SendOTPResponse> {
    // In development mode or if API key is not provided, mock the API call
    if (!this.apiKey || process.env.NODE_ENV === "development") {
      console.log(`[MOCK] Sending OTP ${otp} to ${phone}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock successful response
      return {
        success: true,
        message: "SMS sent successfully (mocked)",
        requestId: `mock_${Date.now()}`
      };
    }
    
    // In production with API key, make actual API call
    try {
      const message = `Your Turbo Groceries OTP is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
      
      const params = new URLSearchParams({
        authorization: this.apiKey,
        sender_id: this.sender,
        message,
        language: "english",
        route: "otp",
        numbers: phone,
      });
      
      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      
      if (data.return) {
        return {
          success: true,
          message: "SMS sent successfully",
          requestId: data.request_id,
        };
      } else {
        throw new Error(data.message || "Failed to send SMS");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  }
}

// Create a singleton instance
const fast2sms = new Fast2SMSClient({
  apiKey: process.env.FAST2SMS_API_KEY || "",
});

export default fast2sms;
