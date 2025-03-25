import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { completeUserRegistration } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useState(new URLSearchParams(window.location.search));

  // Set up the form
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      phone: searchParams.get("phone") || "",
      email: "",
      address: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const result = await completeUserRegistration({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address,
      });

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully",
        });
        setLocation("/");
      } else {
        toast({
          title: "Registration Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Speedy</h1>
          <p className="text-gray-500">Complete your profile to continue</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <CardDescription>
              Please provide your details to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                            +91
                          </div>
                          <Input 
                            {...field}
                            className="rounded-l-none"
                            readOnly={!!searchParams.get("phone")}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your full delivery address"
                          className="resize-none min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            className="text-gray-500 hover:text-primary"
            onClick={() => setLocation("/auth/login")}
          >
            <i className="ri-arrow-left-line mr-1"></i> Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
