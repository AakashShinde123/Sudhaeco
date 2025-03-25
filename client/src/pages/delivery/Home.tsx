import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DeliveryHeader from "@/components/delivery/Header";
import DeliveryBottomNavigation from "@/components/delivery/BottomNavigation";
import DeliveryStats from "@/components/delivery/DeliveryStats";
import CurrentDelivery from "@/components/delivery/CurrentDelivery";
import UpcomingDeliveries from "@/components/delivery/UpcomingDeliveries";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@shared/constants";

export default function DeliveryHome() {
  const { isAuthenticated, isDeliveryPartner } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check for user location permissions for delivery tracking
  useEffect(() => {
    if (isAuthenticated && isDeliveryPartner) {
      if ("geolocation" in navigator) {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
          if (result.state === "denied") {
            toast({
              title: "Location Access Required",
              description: "Please enable location access for accurate delivery tracking.",
              variant: "destructive",
            });
          }
        });
      }
    }
  }, [isAuthenticated, isDeliveryPartner, toast]);

  // Redirect non-delivery users
  if (isAuthenticated && !isDeliveryPartner) {
    navigate("/");
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <DeliveryHeader />
        <main className="container mx-auto px-4 pb-16 flex flex-col items-center justify-center flex-1">
          <div className="text-center p-6 max-w-md mx-auto">
            <span className="material-icons text-neutral-400 text-6xl mb-4">delivery_dining</span>
            <h2 className="text-xl font-semibold mb-2">Delivery Partner Access Required</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Please login with a delivery partner account to access this dashboard.
            </p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
        <DeliveryBottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DeliveryHeader />
      
      <main className="container mx-auto px-4 pb-16">
        <div className="my-6">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Delivery Dashboard
          </h1>
          
          <DeliveryStats />
          <CurrentDelivery />
          <UpcomingDeliveries />
        </div>
      </main>
      
      <DeliveryBottomNavigation />
    </div>
  );
}
