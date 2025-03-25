import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderWithItems } from "@shared/types";
import { API_ENDPOINTS, APP_CURRENCY, ORDER_STATUSES } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";

export default function OrdersManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch orders
  const { data, isLoading, error } = useQuery<{
    orders: OrderWithItems[];
    totalCount: number;
    pageSize: number;
  }>({
    queryKey: [API_ENDPOINTS.ADMIN_ORDERS, page, searchTerm, statusFilter],
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await apiRequest(
        "PATCH", 
        API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), 
        { status }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_ORDERS] });
      setUpdateDialogOpen(false);
      toast({
        title: "Order Updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update the order status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Get the selected order details
  const selectedOrder = data?.orders.find(order => order.id === selectedOrderId);

  // Handle order status update
  const handleUpdateOrder = () => {
    if (!selectedOrderId || !newStatus) return;
    updateStatusMutation.mutate({ orderId: selectedOrderId, status: newStatus });
  };

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins font-semibold text-lg">Orders Management</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2">
              <span className="material-icons text-neutral-400 text-sm">search</span>
            </span>
            <Input
              type="text"
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-auto">
              <span className="flex items-center">
                <span className="material-icons text-neutral-500 dark:text-neutral-400 text-sm mr-1">filter_list</span>
                <SelectValue placeholder="Filter" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Statuses</SelectItem>
              {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 dark:text-red-400">
            Failed to load orders. Please try again.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-dark-border">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-neutral-200 dark:divide-dark-border">
                  {data?.orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                        {order.user.name || order.user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                        {APP_CURRENCY}{(order.total / 100).toFixed(0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color as any || "neutral"}
                        >
                          {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 mr-3"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setViewDialogOpen(true);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-300"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setNewStatus(order.status);
                            setUpdateDialogOpen(true);
                          }}
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                Showing <span className="font-medium">{(page - 1) * (data?.pageSize || 10) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * (data?.pageSize || 10), data?.totalCount || 0)}
                </span>{" "}
                of <span className="font-medium">{data?.totalCount || 0}</span> results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant={page === 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  1
                </Button>
                {data && data.totalCount > data.pageSize && (
                  <Button 
                    variant={page === 2 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setPage(2)}
                    disabled={page === 2 || data.totalCount <= data.pageSize}
                  >
                    2
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!data || page * data.pageSize >= data.totalCount}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Update Order Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Order #{selectedOrder?.orderNumber}</p>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUSES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateOrder}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Order Number</p>
                  <p className="font-medium">#{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Customer</p>
                  <p className="font-medium">{selectedOrder.user.name || selectedOrder.user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Status</p>
                  <Badge 
                    variant={ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES]?.color as any || "neutral"}
                    className="mt-1"
                  >
                    {ORDER_STATUSES[selectedOrder.status as keyof typeof ORDER_STATUSES]?.label || selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Amount</p>
                  <p className="font-medium">{APP_CURRENCY}{(selectedOrder.total / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Payment Method</p>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Delivery Address</p>
                <p className="text-sm bg-neutral-50 dark:bg-neutral-800 p-2 rounded-md">
                  {selectedOrder.address}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800 p-2 rounded-md">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{item.product.name}</span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="text-sm">
                        {APP_CURRENCY}{(item.price * item.quantity / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
