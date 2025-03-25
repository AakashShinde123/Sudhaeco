import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Order, OrderItem } from "@shared/schema";
import { formatCurrency } from "@/utils/format";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  packed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  out_for_delivery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

// Type including order items
interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function Orders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  
  // Query orders
  const { data: orders, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders']
  });
  
  // Filter orders
  const filteredOrders = orders?.filter(order => {
    if (statusFilter && order.status !== statusFilter) {
      return false;
    }
    
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      const orderId = order.id.toString();
      const userId = order.userId.toString();
      
      return orderId.includes(searchTerm) || userId.includes(searchTerm);
    }
    
    return true;
  });
  
  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully."
      });
      setSelectedOrder(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleViewOrder = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };
  
  const handleUpdateStatus = () => {
    if (selectedOrder && newStatus) {
      updateOrderMutation.mutate({
        orderId: selectedOrder.id,
        status: newStatus
      });
    }
  };
  
  const handleAssignDelivery = (orderId: number) => {
    toast({
      title: "Delivery partner assigned",
      description: `Order #${orderId} has been assigned to a delivery partner.`
    });
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AdminSidebar />
      
      <div className="ml-64 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Orders Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and track all customer orders
          </p>
        </header>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by order ID or customer ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All Statuses</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">Loading orders...</div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">
                Failed to load orders
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders?.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.id.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell>User #{order.userId}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{order.items.length} items</TableCell>
                          <TableCell>{formatCurrency(order.total)}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status]}>
                              {statusOptions.find(opt => opt.value === order.status)?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                View
                              </Button>
                              
                              {order.status === 'packed' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleAssignDelivery(order.id)}
                                >
                                  Assign
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  Order #{selectedOrder.id.toString().padStart(4, '0')}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <h3 className="font-medium mb-2">Order Details</h3>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Customer:</span> User #{selectedOrder.userId}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Payment Method:</span> {selectedOrder.paymentMethod}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Payment Status:</span> {selectedOrder.paymentStatus}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Delivery Details</h3>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Address:</span> {selectedOrder.address}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Estimated Delivery:</span> {selectedOrder.estimatedDeliveryTime ? `${selectedOrder.estimatedDeliveryTime} minutes` : 'Not set'}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Partner:</span> {selectedOrder.deliveryPartnerId ? `#${selectedOrder.deliveryPartnerId}` : 'Not assigned'}
                  </p>
                </div>
              </div>
              
              <div className="py-2">
                <h3 className="font-medium mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item ID</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>#{item.id}</TableCell>
                        <TableCell>#{item.productId}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 text-right">
                  <p className="font-medium">Total: {formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
              
              <div className="py-2">
                <h3 className="font-medium mb-2">Update Order Status</h3>
                <div className="flex space-x-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleUpdateStatus} 
                    disabled={updateOrderMutation.isPending || newStatus === selectedOrder.status}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
