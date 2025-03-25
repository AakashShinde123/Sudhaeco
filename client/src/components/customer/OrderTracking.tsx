import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Phone, Check, MotorcycleIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order, OrderItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { addEventListener, removeEventListener } from "@/lib/websocket";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: number;
}

export function OrderTrackingModal({ isOpen, onClose, orderId }: OrderTrackingModalProps) {
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['/api/orders', orderId],
    enabled: isOpen && !!orderId,
  });

  // State for location updates
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!isOpen || !orderId) return;

    const handleLocationUpdate = (data: any) => {
      if (data.location && data.location.userId === order?.deliveryPartnerId) {
        setDeliveryPartnerLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        });
      }
    };

    const handleOrderStatusChange = (data: any) => {
      if (data.order && data.order.id === orderId) {
        // Refresh order data (the query will automatically refetch)
      }
    };

    addEventListener('location_updated', handleLocationUpdate);
    addEventListener('order_status_change', handleOrderStatusChange);

    return () => {
      removeEventListener('location_updated', handleLocationUpdate);
      removeEventListener('order_status_change', handleOrderStatusChange);
    };
  }, [isOpen, orderId, order?.deliveryPartnerId]);

  // Format price from paise to rupees with ₹ symbol
  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(2)}`;
  };

  // Format datetime
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg slide-in p-4 text-center">
          <div className="py-8">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg slide-in p-4">
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">Failed to load order details</div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      ></div>
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg slide-in max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-xl">Track Order</h2>
            <button className="text-gray-500" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="bg-primary bg-opacity-10 p-4 rounded-xl mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Order #{order.id}</span>
              <span className={cn("px-2 py-1 text-xs rounded-full font-medium", {
                "bg-green-100 text-green-800": order.status === "shipped" || order.status === "delivered",
                "bg-yellow-100 text-yellow-800": order.status === "packed",
                "bg-blue-100 text-blue-800": order.status === "pending"
              })}>
                {order.status === "shipped" ? "On the way" : 
                 order.status === "delivered" ? "Delivered" : 
                 order.status === "packed" ? "Packed" : "Processing"}
              </span>
            </div>
            <h3 className="font-bold mb-1">
              {order.status === "shipped" ? 
                `Arriving in ${order.estimatedDeliveryTime} minutes` :
                order.status === "delivered" ? 
                "Delivered" : 
                "Preparing your order"}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <i className="ri-time-line mr-1"></i>
              <span>Order placed at {formatTime(order.createdAt)}</span>
            </div>
          </div>
          
          {order.deliveryPartnerId && order.status === "shipped" && (
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                <i className="ri-user-3-line text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium">Delivery Partner</h3>
                <p className="text-gray-500 text-sm">Your delivery partner</p>
              </div>
              <button className="ml-auto bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                <Phone className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <div className="rounded-lg overflow-hidden mb-4 h-40 bg-gray-100">
            {/* Placeholder for Google Maps */}
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>Live tracking map</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold mb-3">Order Status</h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
              
              <div className="relative z-10 flex mb-6">
                <div className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center mr-3">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <h4 className="font-medium">Order Confirmed</h4>
                  <p className="text-gray-500 text-sm">{formatTime(order.createdAt)}</p>
                </div>
              </div>
              
              <div className="relative z-10 flex mb-6">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mr-3", {
                  "bg-success text-white": ["packed", "shipped", "delivered"].includes(order.status),
                  "bg-gray-200": order.status === "pending"
                })}>
                  {["packed", "shipped", "delivered"].includes(order.status) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <i className="ri-checkbox-circle-line text-gray-400"></i>
                  )}
                </div>
                <div>
                  <h4 className={cn("font-medium", {
                    "text-gray-400": order.status === "pending"
                  })}>Order Packed</h4>
                  <p className="text-gray-500 text-sm">
                    {order.status === "pending" ? "Pending" : formatTime(new Date())}
                  </p>
                </div>
              </div>
              
              <div className="relative z-10 flex mb-6">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mr-3", {
                  "bg-primary text-white pulse": order.status === "shipped",
                  "bg-success text-white": order.status === "delivered",
                  "bg-gray-200": ["pending", "packed"].includes(order.status)
                })}>
                  {order.status === "shipped" ? (
                    <MotorcycleIcon className="h-3 w-3" />
                  ) : order.status === "delivered" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <i className="ri-checkbox-circle-line text-gray-400"></i>
                  )}
                </div>
                <div>
                  <h4 className={cn("font-medium", {
                    "text-gray-400": ["pending", "packed"].includes(order.status)
                  })}>Out for Delivery</h4>
                  <p className="text-gray-500 text-sm">
                    {["pending", "packed"].includes(order.status) ? 
                      "Not yet" : order.status === "shipped" ? 
                      "On the way" : formatTime(new Date())}
                  </p>
                </div>
              </div>
              
              <div className="relative z-10 flex">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center mr-3", {
                  "bg-success text-white": order.status === "delivered",
                  "bg-gray-200": ["pending", "packed", "shipped"].includes(order.status)
                })}>
                  {order.status === "delivered" ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <i className="ri-checkbox-circle-line text-gray-400"></i>
                  )}
                </div>
                <div>
                  <h4 className={cn("font-medium", {
                    "text-gray-400": ["pending", "packed", "shipped"].includes(order.status)
                  })}>Delivered</h4>
                  <p className="text-gray-400 text-sm">
                    {order.status !== "delivered" ? 
                      `Expected by ${formatTime(new Date(Date.now() + 10 * 60 * 1000))}` : 
                      formatTime(new Date())}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold mb-3">Order Summary</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              {order.items?.map((item: OrderItem & { product: Product }) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500">{item.quantity}x</span>
                    <span>{item.product.name}</span>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(order.total - order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              variant="outline"
              className="w-full border border-primary text-primary py-3 rounded-xl font-bold"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
