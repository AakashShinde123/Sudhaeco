import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  Package, 
  Clock, 
  CheckCircle, 
  Bike, 
  MapPin,
  Phone,
  Home
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format";
import { Order, OrderItem, Product } from "@shared/schema";

// WebSocket connection for real-time updates
function useOrderUpdates(orderId: number, onUpdate: (update: any) => void) {
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connected");
      // Send auth message
      socket.send(JSON.stringify({
        type: 'auth',
        userId: localStorage.getItem('userId')
      }));
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Only process updates for this order
      if (data.type === 'orderStatusUpdate' && data.orderId === orderId) {
        onUpdate(data);
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    return () => {
      socket.close();
    };
  }, [orderId, onUpdate]);
}

// Mock delivery partner info
const deliveryPartner = {
  name: "Rahul Kumar",
  phone: "+91 9876543210",
  rating: 4.8,
  vehicleNumber: "KA 01 AB 1234",
  image: "https://randomuser.me/api/portraits/men/32.jpg"
};

interface OrderWithDetails extends Order {
  items: (OrderItem & { product?: Product })[];
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(10);
  
  // Get order details
  const { data: order, isLoading, error } = useQuery<OrderWithDetails>({
    queryKey: [`/api/orders/${id}`]
  });
  
  // Get product details for each order item
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!order
  });
  
  // Update order items with product details
  const orderWithProductDetails = order && products ? {
    ...order,
    items: order.items.map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId)
    }))
  } : order;
  
  // Handle real-time order updates
  useOrderUpdates(parseInt(id), (update) => {
    // In a real app, we would update the order status based on the update
    console.log("Order update received:", update);
  });
  
  // Update progress and countdown timer
  useEffect(() => {
    if (order?.status === 'delivered') {
      setProgress(100);
      setRemainingTime(0);
      return;
    }
    
    if (order?.status === 'cancelled') {
      return;
    }
    
    let initialProgress = 0;
    switch (order?.status) {
      case 'pending':
        initialProgress = 5;
        break;
      case 'preparing':
        initialProgress = 25;
        break;
      case 'packed':
        initialProgress = 50;
        break;
      case 'out_for_delivery':
        initialProgress = 75;
        break;
    }
    
    setProgress(initialProgress);
    
    if (order?.estimatedDeliveryTime) {
      // Calculate remaining time based on order creation time
      const orderTime = new Date(order.createdAt).getTime();
      const estimatedDeliveryMs = order.estimatedDeliveryTime * 60 * 1000;
      const deliveryTime = orderTime + estimatedDeliveryMs;
      const now = Date.now();
      
      const remainingMs = Math.max(0, deliveryTime - now);
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      
      setRemainingTime(remainingMinutes);
      
      // Update countdown every minute
      const intervalId = setInterval(() => {
        setRemainingTime(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(intervalId);
            return 0;
          }
          return newValue;
        });
      }, 60 * 1000);
      
      return () => clearInterval(intervalId);
    }
  }, [order]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-60 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-6 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Order</h2>
          <p className="mb-6">We couldn't find the order you're looking for.</p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  const orderStatusMap: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    'preparing': { label: 'Preparing', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    'packed': { label: 'Packed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    'out_for_delivery': { label: 'Out for Delivery', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
  };
  
  const orderStatus = orderStatusMap[order.status] || orderStatusMap.pending;
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order #{id.padStart(4, '0')}</h1>
          <Badge className={orderStatus.color}>{orderStatus.label}</Badge>
        </div>
        
        {/* Delivery Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-500 transition-all duration-1000 ease-in-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Order placed</span>
                <span className="text-gray-500 dark:text-gray-400">Delivered</span>
              </div>
            </div>
            
            {/* Estimated Time */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery Time</p>
                <p className="text-2xl font-bold text-primary">{remainingTime} min</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your order will be delivered by {new Date(new Date(order.createdAt).getTime() + (order.estimatedDeliveryTime || 10) * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            )}
            
            {order.status === 'delivered' && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-bold text-green-600 dark:text-green-400">Order Delivered</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your order was delivered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            )}
            
            {order.status === 'cancelled' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500 mx-auto mb-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">Order Cancelled</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your order was cancelled
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Delivery Partner */}
        {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bike className="mr-2 h-5 w-5" />
                Delivery Partner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
                  <img 
                    src={deliveryPartner.image} 
                    alt={deliveryPartner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{deliveryPartner.name}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-yellow-400 fill-current mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {deliveryPartner.rating} • {deliveryPartner.vehicleNumber}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Delivery Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <Home className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium">Home</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{order.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Order Items */}
            <div className="space-y-4 mb-6">
              {orderWithProductDetails?.items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 overflow-hidden mr-3">
                    {item.product && (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name || `Product #${item.productId}`}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.product?.unit || 'Unit'} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            
            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Items Total</span>
                <span>{formatCurrency(order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                <span>{formatCurrency(30)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                <span>{formatCurrency(Math.round(order.total * 0.05 / 1.05))}</span>
              </div>
            </div>
            
            {/* Total */}
            <div className="border-t pt-4 flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            
            {/* Payment Method */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Payment Method:</span>
              <span className="ml-2 capitalize">{order.paymentMethod}</span>
              <span className="ml-2">•</span>
              <span className="ml-2 capitalize">{order.paymentStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
