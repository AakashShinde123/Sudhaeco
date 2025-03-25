import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import DeliveryHeader from "@/components/delivery/DeliveryHeader";
import OrderDetails from "@/components/delivery/OrderDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

export default function DeliveryHome() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(false);
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);

  // Get delivery partner details
  const { data: deliveryPartner, isLoading: isLoadingPartner } = useQuery({
    queryKey: [`/api/delivery/partners/by-user/${userData?.id}`],
    select: (data) => data as any,
    enabled: !!userData?.id,
  });

  // Get available orders that can be picked up
  const { data: availableOrders, isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ["/api/orders", { status: "packed" }],
    select: (data) => (data as any).orders as any[],
    enabled: isAvailable && !!deliveryPartner?.id,
  });

  // Get active orders for this delivery partner
  const { data: activeOrders, isLoading: isLoadingActive, refetch: refetchActive } = useQuery({
    queryKey: [`/api/delivery/partners/${deliveryPartner?.id}/orders`],
    select: (data) => (data as any[]).filter(order => order.status === "shipped"),
    enabled: !!deliveryPartner?.id,
  });

  // Update availability status
  const toggleAvailability = async () => {
    try {
      if (deliveryPartner?.id) {
        const newStatus = !isAvailable;
        await apiRequest("PATCH", `/api/delivery/partners/${deliveryPartner.id}/availability`, {
          isAvailable: newStatus
        });
        
        setIsAvailable(newStatus);
        
        toast({
          title: newStatus ? "You're now available" : "You're now offline",
          description: newStatus 
            ? "You'll now receive order notifications" 
            : "You won't receive any new orders",
        });
        
        // Refresh orders list
        refetchOrders();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability status",
        variant: "destructive",
      });
    }
  };

  // Accept an order
  const handleAcceptOrder = async (orderId: number) => {
    try {
      // First change order status to "shipped"
      await apiRequest("PATCH", `/api/orders/${orderId}/status`, {
        status: "shipped"
      });
      
      toast({
        title: "Order Accepted",
        description: "You have successfully accepted the order",
      });
      
      // Redirect to current delivery page
      setLocation("/delivery/current");
      
      // Refresh order lists
      refetchOrders();
      refetchActive();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    }
  };

  // Reject an order - this would be a placeholder in a real app
  const handleRejectOrder = async (orderId: number) => {
    toast({
      title: "Order Rejected",
      description: "The order will be assigned to another delivery partner",
    });
  };

  // Update location periodically
  useEffect(() => {
    if (isAvailable && deliveryPartner?.id) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          
          // Update location in backend
          updateLocation(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location",
            variant: "destructive",
          });
        }
      );
      
      // Set up interval for location updates
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setPosition({ lat: latitude, lng: longitude });
            
            // Update location in backend
            updateLocation(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [isAvailable, deliveryPartner?.id]);

  // Update location in backend
  const updateLocation = async (lat: number, lng: number) => {
    try {
      if (deliveryPartner?.id) {
        await apiRequest("PATCH", `/api/delivery/partners/${deliveryPartner.id}/location`, {
          lat,
          lng
        });
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  // Initialize availability state from data
  useEffect(() => {
    if (deliveryPartner) {
      setIsAvailable(deliveryPartner.isAvailable);
    }
  }, [deliveryPartner]);

  // Loading state
  if (isLoadingPartner) {
    return (
      <div className="p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary mb-2"></i>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  // If user is not a delivery partner
  if (!deliveryPartner?.id) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh] text-center">
        <i className="ri-error-warning-line text-5xl text-amber-500 mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">Account Not Found</h1>
        <p className="text-gray-600 mb-6">
          You don't have a delivery partner account. Please contact the administrator.
        </p>
        <Button onClick={() => setLocation("/auth/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <DeliveryHeader 
        availabilityStatus={isAvailable}
        onToggleAvailability={toggleAvailability}
      />
      
      {isAvailable ? (
        <>
          {/* Earnings Summary Card */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Today's Earnings</p>
                  <p className="text-xl font-bold text-primary">₹{(deliveryPartner?.todayEarnings || 0).toFixed(2)}</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-sm text-gray-500">Deliveries</p>
                  <p className="text-xl font-bold">{deliveryPartner?.totalDeliveries || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Rating</p>
                  <div className="flex items-center justify-center">
                    <p className="text-xl font-bold">{deliveryPartner?.rating.toFixed(1) || 5.0}</p>
                    <i className="ri-star-fill text-amber-400 ml-1"></i>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Current delivery notice */}
          {activeOrders && activeOrders.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <i className="ri-alarm-warning-line text-amber-500 text-xl mr-3"></i>
                <div>
                  <p className="font-medium">You have an active delivery</p>
                  <p className="text-sm text-gray-600">Order #{activeOrders[0].id.toString().padStart(5, '0')}</p>
                </div>
                <Button 
                  className="ml-auto"
                  onClick={() => setLocation("/delivery/current")}
                >
                  View Delivery
                </Button>
              </div>
            </div>
          )}
          
          {/* Available Orders */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Available Orders</h2>
            
            {isLoadingOrders ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <i className="ri-loader-4-line animate-spin text-3xl text-primary mb-2"></i>
                <p>Loading available orders...</p>
              </div>
            ) : availableOrders && availableOrders.length > 0 ? (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <OrderDetails
                    key={order.id}
                    order={order}
                    onAccept={() => handleAcceptOrder(order.id)}
                    onReject={() => handleRejectOrder(order.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <i className="ri-inbox-line text-gray-300 text-5xl mb-4"></i>
                <h3 className="text-lg font-bold text-gray-700 mb-2">No Orders Available</h3>
                <p className="text-gray-500">
                  There are no orders available for you at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>
          
          {/* Map showing current location */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Your Location</h2>
            <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center">
              {position ? (
                <div className="text-center">
                  <p>Your current location is being tracked</p>
                  <p className="text-xs text-gray-500">
                    Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Waiting for location data...</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your location is only shared when you're available and is used to find orders near you
            </p>
          </div>
        </>
      ) : (
        // Offline state
        <div className="text-center py-12 bg-white rounded-lg shadow-sm mb-6">
          <i className="ri-user-follow-line text-gray-300 text-5xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">You're Currently Offline</h2>
          <p className="text-gray-500 mb-6">
            When you're available, you'll see orders that you can deliver
          </p>
          <Button onClick={toggleAvailability} className="bg-green-600 hover:bg-green-700">
            Go Online
          </Button>
        </div>
      )}
      
      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center"
          onClick={() => setLocation("/delivery/history")}
        >
          <i className="ri-history-line text-2xl mb-1"></i>
          <span>Delivery History</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-auto py-4 flex flex-col items-center"
          onClick={() => setLocation("/delivery/earnings")}
        >
          <i className="ri-wallet-3-line text-2xl mb-1"></i>
          <span>Earnings</span>
        </Button>
      </div>
    </div>
  );
}
