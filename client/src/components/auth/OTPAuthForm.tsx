import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { API_ENDPOINTS, OTP_LENGTH } from "@shared/constants";
import { AuthResponse } from "@shared/types";

interface OTPAuthFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
}

export default function OTPAuthForm({ isOpen, onClose, onSuccess }: OTPAuthFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", API_ENDPOINTS.SEND_OTP, { phone });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setStep("otp");
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", API_ENDPOINTS.VERIFY_OTP, { phone, otp });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        onSuccess(data);
        onClose();
        toast({
          title: "Login Successful",
          description: `Welcome ${data.user?.name || 'back'}!`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate();
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      toast({
        title: "Invalid OTP",
        description: `Please enter the complete ${OTP_LENGTH}-digit OTP.`,
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate();
  };

  const handleDemoLogin = () => {
    onSuccess({
      success: true,
      user: {
        id: 1,
        username: "demouser",
        phone: "9876543210",
        name: "Demo User",
        email: "demo@example.com",
        address: "123 Main St, Bangalore",
        role: "customer",
        createdAt: new Date()
      },
      token: "demo-token"
    });
    onClose();
    toast({
      title: "Demo Login Successful",
      description: "You are now logged in as a demo user.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {step === "phone" ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Enter Phone Number</DialogTitle>
            <DialogDescription className="text-center">
              We'll send a one-time password (OTP) to verify your phone number.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendOTP}>
            <div className="flex items-center space-x-2 mt-4">
              <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-dark-border rounded-l-md px-3 py-2 flex items-center justify-center">
                <span className="text-neutral-700 dark:text-neutral-300">+91</span>
              </div>
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
                pattern="[0-9]{10}"
                className="flex-1"
                required
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={handleDemoLogin}
              >
                Demo Login
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      ) : (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Enter OTP</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a one-time password to +91 {phone}. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyOTP}>
            <div className="flex justify-center my-6">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            
            <div className="text-center mt-2 mb-6">
              <button 
                type="button" 
                className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                onClick={() => sendOtpMutation.mutate()}
                disabled={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
              </button>
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={verifyOtpMutation.isPending}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={() => setStep("phone")}
              >
                Back
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
