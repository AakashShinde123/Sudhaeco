import React, { useEffect, useState } from "react";
import { useOrderTracking } from "@/lib/websocket";
import { useOrder } from "@/hooks/useOrders";
import { formatPrice, formatDatetime, getOrderStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

export default function OrderTrackingModal({
  isOpen,
  onClose,
  orderId,
}: OrderTrackingModalProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const { data: order, isLoading } = useOrder(orderId || "");
  const { orderStatus, eta, deliveryLocation, isConnected } = useOrderTracking(orderId || "");

  // Load map when component mounts
  useEffect(() => {
    if (isOpen && orderId) {
      // Map implementation would go here
      setMapLoaded(true);
    }
  }, [isOpen, orderId]);

  // Render loading state
  if (isLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl p-0">
          <SheetHeader className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <SheetTitle className="font-bold text-xl">Track Order</SheetTitle>
              <SheetClose className="text-gray-500">
                <i className="ri-close-line text-xl"></i>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="p-4">
            <Skeleton className="h-28 w-full rounded-xl mb-4" />
            <Skeleton className="h-14 w-full rounded-lg mb-4" />
            <Skeleton className="h-40 w-full rounded-lg mb-4" />
            <Skeleton className="h-60 w-full rounded-lg mb-4" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!order && !isLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-xl p-0">
          <SheetHeader className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <SheetTitle className="font-bold text-xl">Track Order</SheetTitle>
              <SheetClose className="text-gray-500">
                <i className="ri-close-line text-xl"></i>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="p-4 flex flex-col items-center justify-center h-40">
            <i className="ri-error-warning-line text-4xl text-amber-500 mb-2"></i>
            <p className="text-gray-600">Order not found</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Status from websocket or fallback to order data
  const status = orderStatus || order?.status || "pending";
  const estimatedTime = eta || order?.eta || 10;
  const orderNumber = `SPDY${order?.id.toString().padStart(5, "0")}`;
  const statusInfo = getOrderStatus(status);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl p-0">
        <SheetHeader className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <SheetTitle className="font-bold text-xl">Track Order</SheetTitle>
            <SheetClose className="text-gray-500">
              <i className="ri-close-line text-xl"></i>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="p-4 overflow-auto h-[calc(100%-68px)]">
          <div className="bg-primary bg-opacity-10 p-4 rounded-xl mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Order #{orderNumber}</span>
              <span className={`px-2 py-1 ${statusInfo.color} text-xs rounded-full font-medium`}>
                {statusInfo.label}
              </span>
            </div>
            <h3 className="font-bold mb-1">
              {status === "delivered" 
                ? "Delivered" 
                : `Arriving in ${estimatedTime} minutes`}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <i className="ri-time-line mr-1"></i>
              <span>Order placed at {formatDatetime(order?.createdAt || new Date())}</span>
            </div>
          </div>

          {order?.deliveryPartnerId && (
            <div className="flex items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                <i className="ri-user-3-line text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium">Delivery Partner</h3>
                <p className="text-gray-500 text-sm">Your delivery partner</p>
              </div>
              <button className="ml-auto bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
                <i className="ri-phone-line"></i>
              </button>
            </div>
          )}

          <div className="rounded-lg overflow-hidden mb-4 h-40 bg-gray-100" id="tracking-map">
            {!mapLoaded ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span>Loading map...</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span>Live tracking map</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-3">Order Status</h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>

              <div className="relative z-10 flex mb-6">
                <div className={`w-6 h-6 rounded-full ${status === "pending" ? "bg-primary pulse" : "bg-success"} text-white flex items-center justify-center mr-3`}>
                  <i className="ri-check-line"></i>
                </div>
                <div>
                  <h4 className="font-medium">Order Confirmed</h4>
                  <p className="text-gray-500 text-sm">
                    {formatDatetime(order?.createdAt || new Date())}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex mb-6">
                <div className={`w-6 h-6 rounded-full ${status === "packed" ? "bg-primary pulse" : (["shipped", "delivered"].includes(status) ? "bg-success" : "bg-gray-200")} text-white flex items-center justify-center mr-3`}>
                  {["packed", "shipped", "delivered"].includes(status) ? (
                    <i className="ri-check-line"></i>
                  ) : (
                    <i className="ri-checkbox-circle-line text-gray-400"></i>
                  )}
                </div>
                <div>
                  <h4 className={`font-medium ${["pending"].includes(status) ? "text-gray-400" : ""}`}>
                    Order Packed
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {["packed", "shipped", "delivered"].includes(status)
                      ? formatDatetime(new Date(new Date(order?.createdAt || new Date()).getTime() + 3 * 60000))
                      : "Pending"}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex mb-6">
                <div className={`w-6 h-6 rounded-full ${status === "shipped" ? "bg-primary pulse" : (["delivered"].includes(status) ? "bg-success" : "bg-gray-200")} text-white flex items-center justify-center mr-3`}>
                  {["shipped", "delivered"].includes(status) ? (
                    <i className="ri-motorcycle-fill"></i>
                  ) : (
                    <i className="ri-checkbox-circle-line text-gray-400"></i>
                  )}
                </div>
                <div>
                  <h4 className={`font-medium ${["pending", "packed"].includes(status) ? "text-gray-400" : ""}`}>
                    Out for Delivery
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {["shipped", "delivered"].includes(status)
                      ? formatDatetime(new Date(new Date(order?.createdAt || new Date()).getTime() + 7 * 60000))
                      : "Pending"}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex">
                <div className={`w-6 h-6 rounded-full ${status === "delivered" ? "bg-success" : "bg-gray-200"} flex items-center justify-center mr-3`}>
                  {status === "delivered" ? (
                    <i className="ri-check-double-line"></i>
                  ) : (
                    <i className="ri-checkbox-circle-line text-gray-400"></i>
                  )}
                </div>
                <div>
                  <h4 className={`font-medium ${status !== "delivered" ? "text-gray-400" : ""}`}>
                    Delivered
                  </h4>
                  <p className={`${status !== "delivered" ? "text-gray-400" : "text-gray-500"} text-sm`}>
                    {status === "delivered"
                      ? formatDatetime(new Date(new Date(order?.updatedAt || new Date()).getTime()))
                      : `Expected by ${formatDatetime(new Date(new Date(order?.createdAt || new Date()).getTime() + estimatedTime * 60000))}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-3">Order Summary</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              {order?.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-500">{item.quantity}x</span>
                    <span>{item.productName}</span>
                  </div>
                  <span className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order?.amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span>{formatPrice(order?.deliveryFee || 0)}</span>
              </div>
              {order?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatPrice(order?.discount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2">
                <span>Total</span>
                <span>{formatPrice(order?.total || 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full border border-primary text-primary py-3 rounded-xl font-bold h-12"
            >
              View Order Details
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
