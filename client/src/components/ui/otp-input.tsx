import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface OtpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  length?: number;
  onComplete?: (otp: string) => void;
}

export function OtpInput({
  length = 6,
  onComplete,
  className,
  ...props
}: OtpInputProps) {
  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""));
  const inputRefs = React.useRef<HTMLInputElement[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    
    // If user pastes multiple digits, distribute them
    if (value.length > 1) {
      const digits = value.split("");
      for (let i = 0; i < digits.length && index + i < length; i++) {
        newOtp[index + i] = digits[i];
      }
      // Move focus to appropriate input
      const nextIndex = Math.min(index + value.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Single digit
      newOtp[index] = value;
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    setOtp(newOtp);

    // Check if OTP is complete
    const newOtpString = newOtp.join("");
    if (newOtpString.length === length && onComplete) {
      onComplete(newOtpString);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    const digits = pastedData.split("").filter(char => !isNaN(Number(char)));
    
    if (digits.length === 0) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < digits.length && index + i < length; i++) {
      newOtp[index + i] = digits[i];
    }
    
    setOtp(newOtp);
    
    // Move focus to appropriate input or last input if filled
    const nextIndex = Math.min(index + digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    
    // Check if OTP is complete
    const newOtpString = newOtp.join("");
    if (newOtpString.length === length && onComplete) {
      onComplete(newOtpString);
    }
  };

  React.useEffect(() => {
    // Pre-fill inputRefs array with the correct length
    inputRefs.current = inputRefs.current.slice(0, length);
    // Initialize OTP array with the correct length
    setOtp(Array(length).fill(""));
  }, [length]);

  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          className={cn(
            "w-12 h-12 text-center text-lg font-bold focus:ring-primary",
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
}
