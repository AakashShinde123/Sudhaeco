import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber?: string;
  onSuccess?: () => void;
}

export default function OTPModal({ 
  isOpen, 
  onClose, 
  phoneNumber: initialPhone = "",
  onSuccess
}: OTPModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { sendOtpToPhone, verifyOtpCode, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (initialPhone) {
      setPhoneNumber(initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber.match(/^[0-9]{10}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await sendOtpToPhone(phoneNumber);
      if (result.success) {
        setStep("otp");
        setCountdown(30); // 30 seconds countdown for resend
        toast({
          title: "OTP Sent",
          description: `We've sent a 6-digit OTP to +91 ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpCode.join("");
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await verifyOtpCode(phoneNumber, otp);
      if (result.success) {
        toast({
          title: "Verification Successful",
          description: "Your phone number has been verified successfully!",
        });
        onSuccess?.();
        onClose();
      } else {
        toast({
          title: "Verification Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      const result = await sendOtpToPhone(phoneNumber);
      if (result.success) {
        setCountdown(30);
        toast({
          title: "OTP Resent",
          description: `We've sent a new 6-digit OTP to +91 ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {step === "phone" ? "Phone Verification" : "Enter OTP"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === "phone" ? (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-4">
                We'll send you a one-time password to verify your phone number
              </p>
              
              <div className="flex items-center">
                <span className="px-3 bg-gray-100 h-10 flex items-center rounded-l-md border border-r-0 border-gray-300">
                  +91
                </span>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Phone Number"
                  className="rounded-l-none"
                  maxLength={10}
                />
              </div>
              
              <Button 
                className="w-full bg-primary" 
                onClick={handleSendOTP}
                disabled={isLoading || phoneNumber.length !== 10}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-600 text-center">
                We've sent a 6-digit OTP to <span className="font-semibold">+91 {phoneNumber}</span>
              </p>
              
              <div className="flex justify-between mb-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otpCode[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 rounded-lg border border-gray-300 text-center text-xl font-bold"
                  />
                ))}
              </div>
              
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-1">Didn't receive code?</p>
                <Button 
                  variant="link" 
                  className="text-primary font-medium p-0"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || isResending}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                </Button>
              </div>
              
              <Button 
                className="w-full bg-primary" 
                onClick={handleVerifyOTP} 
                disabled={isLoading || otpCode.some(digit => digit === "")}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setStep("phone")}
              >
                Change Phone Number
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
