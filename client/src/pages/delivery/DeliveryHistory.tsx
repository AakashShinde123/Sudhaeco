import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDatetime, getOrderStatus } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";

export default function DeliveryHistory() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Get delivery partner details
  const { data: deliveryPartner, isLoading: isLoadingPartner } = useQuery({
    queryKey: [`/api/delivery/partners/by-user/${userData?.id}`],
    select: (data) => data as any,
    enabled: !!userData?.id,
  });

  // Get orders history for this delivery partner
  const { data: orderHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: [`/api/delivery/partners/${deliveryPartner?.id}/orders`],
    select: (data) => data as any[],
    enabled: !!deliveryPartner?.id,
  });

  // Filter orders by status
  const filteredOrders = orderHistory?.filter(order => 
    statusFilter ? order.status === statusFilter : true
  ) || [];

  // Group orders by date
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-IN');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {} as Record<string, any[]>);

  // View order details
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Loading state
  if (isLoadingPartner || isLoadingHistory) {
    return (
      <div className="p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary mb-2"></i>
          <p>Loading delivery history...</p>
        </div>
      </div>
    );
  }

  // If no delivery partner found
  if (!deliveryPartner?.id) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh] text-center">
        <i className="ri-error-warning-line text-5xl text-amber-500 mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">Account Not Found</h1>
        <p className="text-gray-600 mb-6">
          You don't have a delivery partner account. Please contact the administrator.
        </p>
        <Button onClick={() => setLocation("/delivery/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Delivery History</h1>
        
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={undefined}>All Orders</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="shipped">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Summary */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-xl font-bold">{deliveryPartner?.totalDeliveries || 0}</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-600">
                {orderHistory?.filter(order => order.status === "delivered").length || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-xl font-bold text-red-600">
                {orderHistory?.filter(order => order.status === "cancelled").length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {Object.keys(groupedOrders).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([date, orders]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-2">{date}</h2>
              <div className="space-y-3">
                {orders.map((order) => {
                  const statusInfo = getOrderStatus(order.status);
                  return (
                    <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleViewOrder(order)}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold">Order #{order.id.toString().padStart(5, '0')}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{order.userName || "Customer"}</p>
                            <p className="text-xs text-gray-500">{formatDatetime(order.createdAt)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-right">{formatPrice(order.total)}</p>
                            <p className="text-xs text-gray-500">
                              {order.items?.length || 0} items
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <i className="ri-history-line text-gray-300 text-5xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Orders Found</h2>
          <p className="text-gray-500">
            {statusFilter 
              ? `You don't have any ${statusFilter} orders`
              : "You haven't delivered any orders yet"}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">Order #{selectedOrder.id.toString().padStart(5, '0')}</h3>
                  <p className="text-sm text-gray-500">{formatDatetime(selectedOrder.createdAt)}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatus(selectedOrder.status).color}`}>
                  {getOrderStatus(selectedOrder.status).label}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-1">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Name:</span> {selectedOrder.userName || "Not provided"}</p>
                  <p><span className="text-gray-500">Phone:</span> {selectedOrder.userPhone || "Not provided"}</p>
                  <p><span className="text-gray-500">Address:</span> {selectedOrder.address}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
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
                    <span>{formatPrice(selectedOrder.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-green-600">-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <p className="font-medium">Order Notes:</p>
                <p className="text-gray-600">
                  {selectedOrder.orderNotes || "No notes provided for this order."}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
