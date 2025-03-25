import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { phoneSchema } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { sendOtpToPhone, isLoading } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10); // Remove non-digits and limit to 10 chars
    setPhoneNumber(value);
    setPhoneError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    try {
      phoneSchema.parse(phoneNumber);
    } catch (error) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }
    
    try {
      const result = await sendOtpToPhone(phoneNumber);
      
      if (result.success) {
        setLocation(`/auth/verify?phone=${phoneNumber}`);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Speedy</h1>
          <p className="text-gray-500">Groceries delivered in 10 minutes</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Login / Sign Up</CardTitle>
            <CardDescription>
              Enter your phone number to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                      +91
                    </div>
                    <Input 
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className="rounded-l-none"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                    />
                  </div>
                  {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
                </div>
                <Button className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Sending OTP...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  By continuing, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </p>
              </div>
            </form>
          </CardContent>
          <Separator className="my-4" />
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full flex items-center justify-center">
              <div className="text-sm text-gray-500">
                Want to become a delivery partner?
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = "mailto:partners@speedy.com"}
            >
              <i className="ri-bike-line mr-2"></i>
              Join as Delivery Partner
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
