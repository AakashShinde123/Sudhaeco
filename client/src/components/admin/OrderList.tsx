import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Clock, Eye, Bike } from "lucide-react";

export function OrderList() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });
  
  const { data: deliveryPartners } = useQuery({
    queryKey: ['/api/delivery-partners'],
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Order detail modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Assign delivery partner modal state
  const [isAssignPartnerOpen, setIsAssignPartnerOpen] = useState(false);
  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState<number | null>(null);
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
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
        description: "Order status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update order status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Assign delivery partner mutation
  const assignDeliveryPartner = useMutation({
    mutationFn: async ({ orderId, deliveryPartnerId }: { orderId: number, deliveryPartnerId: number }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/assign`, { deliveryPartnerId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsAssignPartnerOpen(false);
      toast({
        title: "Delivery partner assigned",
        description: "Delivery partner has been assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to assign delivery partner",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatus.mutate({ orderId, status });
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };
  
  const handleAssignPartner = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryPartnerId(order.deliveryPartnerId || null);
    setIsAssignPartnerOpen(true);
  };
  
  const confirmAssignPartner = () => {
    if (selectedOrder && selectedDeliveryPartnerId) {
      assignDeliveryPartner.mutate({
        orderId: selectedOrder.id,
        deliveryPartnerId: selectedDeliveryPartnerId
      });
    }
  };
  
  // Format time
  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Calculate time ago
  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(2)}`;
  };
  
  // Filter orders based on status
  const filteredOrders = orders?.filter(order => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  }) || [];
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Orders</h2>
          <div className="w-40 h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="p-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="flex justify-between items-center py-4 border-b border-gray-100">
                <div className="w-24 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-32 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-24 h-6 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="packed">Packed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <span className="text-sm text-gray-500">Total: {filteredOrders.length} orders</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                        <span className="text-sm font-medium">
                          {order.userId.toString().charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium">User {order.userId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className={`w-32 ${
                        order.status === "delivered" ? "bg-green-100 text-green-800" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-800" :
                        order.status === "packed" ? "bg-amber-100 text-amber-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{getTimeAgo(order.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewOrder(order)}
                        className="flex items-center"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      
                      {order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignPartner(order)}
                          className="flex items-center"
                        >
                          <Bike className="mr-1 h-4 w-4" />
                          Assign
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Order Detail Modal */}
      <AlertDialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Order #{selectedOrder?.id}</AlertDialogTitle>
            <AlertDialogDescription>
              Created on {selectedOrder && formatDate(selectedOrder.createdAt)} at {selectedOrder && formatTime(selectedOrder.createdAt)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">Delivery Address</h4>
              <p className="text-sm">{selectedOrder?.deliveryAddress}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">Payment Method</h4>
              <p className="text-sm">{selectedOrder?.paymentMethod}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">Payment Status</h4>
              <p className="text-sm">{selectedOrder?.paymentStatus}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-500 mb-1">Delivery Partner</h4>
              <p className="text-sm">{selectedOrder?.deliveryPartnerId ? `ID: ${selectedOrder.deliveryPartnerId}` : "Not assigned"}</p>
            </div>
          </div>
          
          <div className="border rounded-md p-4 mb-4">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{selectedOrder && formatPrice(selectedOrder.total - selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>{selectedOrder && formatPrice(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>{selectedOrder && formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Assign Delivery Partner Modal */}
      <AlertDialog open={isAssignPartnerOpen} onOpenChange={setIsAssignPartnerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Delivery Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Select a delivery partner to assign to order #{selectedOrder?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <Select
              value={selectedDeliveryPartnerId?.toString() || ''}
              onValueChange={(value) => setSelectedDeliveryPartnerId(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a delivery partner" />
              </SelectTrigger>
              <SelectContent>
                {deliveryPartners?.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name || `Partner ${partner.id}`} ({partner.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAssignPartner}>Assign</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
