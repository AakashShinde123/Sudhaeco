import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { updateDeliveryPartnerLocation } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import { 
  Bike, 
  Package, 
  MapPin, 
  Clock, 
  Navigation, 
  Phone, 
  CheckCircle,
  User
} from "lucide-react";

export function DeliveryApp() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  
  // Query for assigned orders
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/orders'],
    select: (data) => {
      // Filter orders that are assigned to the current delivery partner
      return data.filter(order => order.deliveryPartnerId === user?.id && order.status !== "delivered");
    },
    enabled: !!user?.id,
  });
  
  // Query for order details when an order is selected
  const { data: orderDetails, isLoading: isOrderDetailsLoading } = useQuery({
    queryKey: ['/api/orders', selectedOrder],
    enabled: !!selectedOrder,
  });
  
  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully",
      });
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setLocation(newLocation);
          
          // Send location to server if user is available
          if (user && isAvailable) {
            updateDeliveryPartnerLocation(
              user.id,
              newLocation.latitude,
              newLocation.longitude,
              isAvailable
            );
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location error",
            description: "Failed to get your current location. Please enable location services.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      toast({
        title: "Location not supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  }, [user, isAvailable, toast]);
  
  // Update availability status
  const toggleAvailability = () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    if (user && location) {
      updateDeliveryPartnerLocation(
        user.id,
        location.latitude,
        location.longitude,
        newStatus
      );
      
      toast({
        title: newStatus ? "You are now online" : "You are now offline",
        description: newStatus 
          ? "You will now receive delivery assignments" 
          : "You will not receive new assignments",
      });
    }
  };
  
  // Mark order as delivered
  const markAsDelivered = (orderId: number) => {
    updateOrderStatus.mutate({ orderId, status: "delivered" });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white p-4 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Bike className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">Speedy</h1>
              <p className="text-sm text-gray-500">Delivery Partner</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">
                {isAvailable ? "Online" : "Offline"}
              </span>
              <Switch
                checked={isAvailable}
                onCheckedChange={toggleAvailability}
              />
            </div>
            
            <Avatar>
              <AvatarFallback className="bg-primary text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User />}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Location</CardTitle>
            </CardHeader>
            <CardContent>
              {location ? (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary mr-2" />
                  <span>
                    Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
                  </span>
                </div>
              ) : (
                <div className="text-yellow-600 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Getting your location...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-bold mb-4">Assigned Orders ({orders.length})</h2>
        
        {isOrdersLoading ? (
          <div className="text-center py-8">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card className="bg-white p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No Active Orders</h3>
              <p className="text-gray-500 mt-2">
                You don't have any assigned orders at the moment.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="bg-white overflow-hidden">
                <CardHeader className="pb-2 bg-primary bg-opacity-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-primary mr-2" />
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    </div>
                    <Badge variant={order.status === "packed" ? "outline" : "secondary"}>
                      {order.status === "packed" ? "Ready for pickup" : "In transit"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">{order.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">
                        Estimated delivery time: {order.estimatedDeliveryTime} min
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium">
                        Total amount: {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedOrder(order.id)}
                    >
                      View Details
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Navigate
                      </Button>
                      
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => markAsDelivered(order.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Order Details Dialog */}
        {selectedOrder && orderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order #{orderDetails.id} Details</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Delivery Address</h3>
                      <p>{orderDetails.deliveryAddress}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                      <p>{orderDetails.paymentMethod}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                    <div className="border rounded-md divide-y">
                      {orderDetails.items?.map((item) => (
                        <div key={item.id} className="flex justify-between py-2 px-3">
                          <div className="flex items-center">
                            <span className="mr-2 text-gray-500">{item.quantity}x</span>
                            <span>{item.product.name}</span>
                          </div>
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(orderDetails.total - orderDetails.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span>{formatCurrency(orderDetails.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span>{formatCurrency(orderDetails.total)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      className="flex items-center"
                      onClick={() => window.open(`tel:${orderDetails.userId}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>
                    
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => markAsDelivered(orderDetails.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
