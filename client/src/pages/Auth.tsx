import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { useToast } from "@/hooks/use-toast";
import { validatePhone } from "@/utils/validation";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

enum AuthStep {
  PHONE_ENTRY,
  OTP_VERIFICATION
}

export default function Auth() {
  const [location, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<AuthStep>(AuthStep.PHONE_ENTRY);
  const [otp, setOtp] = useState("");
  
  // Mutation for sending OTP
  const sendOtpMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await apiRequest("POST", "/api/auth/send-otp", { phone: phoneNumber });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "OTP Sent",
        description: "We've sent an OTP to your phone number. Please check and enter it."
      });
      setStep(AuthStep.OTP_VERIFICATION);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutation for verifying OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phoneNumber, otpCode }: { phoneNumber: string, otpCode: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", { 
        phone: phoneNumber,
        otp: otpCode
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Authentication successful",
          description: "You have been logged in successfully."
        });
        login(data.user);
        
        // Redirect to home page or previous page
        const redirectPath = new URLSearchParams(location.split('?')[1] || '').get('redirect') || '/';
        navigate(redirectPath);
      } else {
        toast({
          title: "Authentication failed",
          description: data.message || "Invalid OTP. Please try again.",
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!validatePhone(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }
    
    // Send OTP
    sendOtpMutation.mutate(phone);
  };
  
  const handleVerifyOtp = (otpCode: string) => {
    setOtp(otpCode);
    
    // Verify OTP if complete (6 digits)
    if (otpCode.length === 6) {
      verifyOtpMutation.mutate({ phoneNumber: phone, otpCode });
    }
  };
  
  const handleResendOtp = () => {
    sendOtpMutation.mutate(phone);
  };
  
  const handleBackToPhone = () => {
    setStep(AuthStep.PHONE_ENTRY);
    setOtp("");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary">
              Turbo <span className="text-accent-500">Groceries</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Log in to experience 10-minute grocery delivery
            </p>
          </div>
          
          {step === AuthStep.PHONE_ENTRY ? (
            <form onSubmit={handleSendOtp}>
              <div className="mb-6">
                <Label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Mobile Number
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">+91</span>
                  </div>
                  <Input
                    type="tel"
                    id="phone"
                    className="pl-12"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your mobile number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <div>
              <div className="mb-6">
                <Label className="block text-sm font-medium mb-2">
                  Enter OTP
                </Label>
                <OtpInput
                  length={6}
                  onComplete={handleVerifyOtp}
                  className="w-10 h-12 text-center text-lg font-bold"
                />
                <div className="text-center mt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Didn't receive OTP?
                  </span>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm text-primary font-medium ml-1 p-0 h-auto"
                    onClick={handleResendOtp}
                    disabled={sendOtpMutation.isPending}
                  >
                    Resend OTP
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  disabled={verifyOtpMutation.isPending || otp.length < 6}
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleBackToPhone}
                  disabled={verifyOtpMutation.isPending}
                >
                  Change Phone Number
                </Button>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            By continuing, you agree to our
            {" "}
            <a href="#" className="text-primary hover:text-primary/90">
              Terms of Service
            </a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:text-primary/90">
              Privacy Policy
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
