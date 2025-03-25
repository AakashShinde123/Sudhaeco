import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatDatetime } from "@/lib/utils";
import { useLocationUpdater } from "@/lib/websocket";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function CurrentDelivery() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState("");
  const { updateLocation, isConnected } = useLocationUpdater();

  // Get delivery partner details
  const { data: deliveryPartner, isLoading: isLoadingPartner } = useQuery({
    queryKey: [`/api/delivery/partners/by-user/${userData?.id}`],
    select: (data) => data as any,
    enabled: !!userData?.id,
  });

  // Get active orders for this delivery partner
  const { data: activeOrders, isLoading: isLoadingActive } = useQuery({
    queryKey: [`/api/delivery/partners/${deliveryPartner?.id}/orders`],
    select: (data) => (data as any[]).filter(order => order.status === "shipped"),
    enabled: !!deliveryPartner?.id,
  });

  // Current active order
  const currentOrder = activeOrders && activeOrders.length > 0 ? activeOrders[0] : null;

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/delivery/partners/${deliveryPartner?.id}/orders`] });
      setShowDeliveryConfirm(false);
      toast({
        title: "Delivery Completed",
        description: "Order has been marked as delivered",
      });
      setLocation("/delivery/home");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Mark order as delivered
  const completeDelivery = () => {
    // In a real app, we would verify the delivery code here
    if (!currentOrder) return;
    
    // For demo purposes, let's just complete the order
    updateOrderStatusMutation.mutate({
      orderId: currentOrder.id,
      status: "delivered"
    });
  };

  // Update location periodically
  useEffect(() => {
    if (deliveryPartner?.id && currentOrder) {
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          
          // Update location in backend and via websocket
          updateLocationData(latitude, longitude);
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
            
            // Update location in backend and via websocket
            updateLocationData(latitude, longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [deliveryPartner?.id, currentOrder]);

  // Update location in backend and via websocket
  const updateLocationData = async (lat: number, lng: number) => {
    try {
      if (deliveryPartner?.id) {
        // Update via REST API
        await apiRequest("PATCH", `/api/delivery/partners/${deliveryPartner.id}/location`, {
          lat,
          lng
        });
        
        // Update via WebSocket for real-time tracking
        if (isConnected && currentOrder) {
          updateLocation(
            { lat, lng },
            currentOrder.id
          );
        }
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  // Call customer
  const callCustomer = () => {
    if (currentOrder && currentOrder.userPhone) {
      window.location.href = `tel:${currentOrder.userPhone}`;
    } else {
      toast({
        title: "Cannot call customer",
        description: "Customer phone number is not available",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoadingPartner || isLoadingActive) {
    return (
      <div className="p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary mb-2"></i>
          <p>Loading delivery information...</p>
        </div>
      </div>
    );
  }

  // If no active delivery
  if (!currentOrder) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh] text-center">
        <i className="ri-bike-line text-5xl text-gray-300 mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">No Active Delivery</h1>
        <p className="text-gray-600 mb-6">
          You don't have any active deliveries at the moment.
        </p>
        <Button onClick={() => setLocation("/delivery/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Delivery Status */}
      <Card className="mb-6 border-primary">
        <CardContent className="p-4">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse mr-2"></div>
            <h2 className="text-lg font-bold">Delivery in Progress</h2>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Order #{currentOrder.id.toString().padStart(5, '0')}</p>
              <p className="font-medium">{formatPrice(currentOrder.total)}</p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-primary border-primary"
              onClick={() => setShowDeliveryConfirm(true)}
            >
              Complete Delivery
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Map */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Delivery Route</h2>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-2">
          {position ? (
            <div className="text-center">
              <p className="font-medium">Navigating to customer</p>
              <p className="text-sm text-gray-500">
                {currentOrder.address}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">Waiting for location data...</p>
          )}
        </div>
        {position && (
          <div className="text-center">
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Open in Google Maps
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentOrder.address)}`,
                  '_blank'
                );
              }}
            >
              <i className="ri-navigation-line mr-2"></i>
              Navigate with Google Maps
            </Button>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-2">Customer Information</h2>
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <i className="ri-user-3-line text-gray-400 mt-0.5"></i>
              <div>
                <p className="font-medium">{currentOrder.userName || "Customer"}</p>
                {currentOrder.userPhone && (
                  <p className="text-sm text-gray-500">{currentOrder.userPhone}</p>
                )}
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <i className="ri-map-pin-line text-gray-400 mt-0.5"></i>
              <p className="text-sm">{currentOrder.address}</p>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between">
            <Button variant="outline" className="flex-1 mr-2" onClick={callCustomer}>
              <i className="ri-phone-line mr-2"></i>
              Call Customer
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowDeliveryConfirm(true)}>
              <i className="ri-check-double-line mr-2"></i>
              Mark Delivered
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-2">Order Details</h2>
          <div className="space-y-2 mb-4">
            {currentOrder.items && currentOrder.items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{item.quantity}x</span>
                  <span>{item.productName}</span>
                </div>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(currentOrder.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span>{formatPrice(currentOrder.deliveryFee)}</span>
            </div>
            {currentOrder.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">-{formatPrice(currentOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-1">
              <span>Total</span>
              <span>{formatPrice(currentOrder.total)}</span>
            </div>
            {currentOrder.paymentMethod && (
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-500">Payment Method</span>
                <span className="capitalize">{currentOrder.paymentMethod}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={showDeliveryConfirm} onOpenChange={setShowDeliveryConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">Please enter the delivery OTP or mark as delivered:</p>
            
            <div className="mb-4">
              <label htmlFor="deliveryCode" className="block text-sm font-medium mb-1">
                Delivery OTP (Optional)
              </label>
              <input
                id="deliveryCode"
                type="text"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter OTP code"
                value={deliveryCode}
                onChange={(e) => setDeliveryCode(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ask customer for the delivery OTP for verification
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={completeDelivery}
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                "Mark as Delivered"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
