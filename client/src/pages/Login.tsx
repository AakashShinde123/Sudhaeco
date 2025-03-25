import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import OTPAuthForm from "@/components/auth/OTPAuthForm";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@shared/constants";

export default function Login() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // If already authenticated, redirect based on user role
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "delivery") {
        navigate("/delivery");
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  // If there's a redirect parameter in the URL, extract it
  const getRedirectUrl = () => {
    try {
      const url = new URL(window.location.href);
      return url.searchParams.get("redirect") || "/";
    } catch (e) {
      return "/";
    }
  };

  const handleLoginSuccess = (authResponse: any) => {
    // After successful login, the AuthContext will handle the redirect
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-dark-surface shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-primary-600 dark:text-primary-400 font-poppins font-bold text-xl">
              {APP_NAME}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-dark-background">
        <div className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Welcome to {APP_NAME}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Login to your account to order groceries, track deliveries, and more.
            </p>
          </div>
          
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                Login with OTP
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                We'll send a one-time password to your phone for secure login.
              </p>
              <Button 
                className="w-full"
                onClick={() => setShowAuthModal(true)}
              >
                Continue with Phone
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-dark-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-dark-surface px-2 text-neutral-500 dark:text-neutral-400">
                  Or try demo accounts
                </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleLoginSuccess({
                    success: true,
                    user: {
                      id: 1,
                      username: "customer",
                      phone: "9876543210",
                      name: "Demo Customer",
                      email: "customer@example.com",
                      address: "123 Main St, Bangalore",
                      role: "customer",
                      createdAt: new Date()
                    },
                    token: "demo-customer-token"
                  });
                }}
              >
                Demo Customer
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleLoginSuccess({
                    success: true,
                    user: {
                      id: 2,
                      username: "admin",
                      phone: "9876543211",
                      name: "Demo Admin",
                      email: "admin@example.com",
                      address: "456 Admin St, Bangalore",
                      role: "admin",
                      createdAt: new Date()
                    },
                    token: "demo-admin-token"
                  });
                }}
              >
                Demo Admin
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleLoginSuccess({
                    success: true,
                    user: {
                      id: 3,
                      username: "delivery",
                      phone: "9876543212",
                      name: "Demo Delivery Partner",
                      email: "delivery@example.com",
                      address: "789 Delivery St, Bangalore",
                      role: "delivery",
                      createdAt: new Date()
                    },
                    token: "demo-delivery-token"
                  });
                }}
              >
                Demo Delivery Partner
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-center text-neutral-500 dark:text-neutral-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
      
      {/* OTP Auth Modal */}
      <OTPAuthForm 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
