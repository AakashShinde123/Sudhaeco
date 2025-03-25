import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DeliveryHeader from "@/components/delivery/Header";
import DeliveryBottomNavigation from "@/components/delivery/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { OrderWithItems } from "@shared/types";
import { API_ENDPOINTS, ORDER_STATUSES, APP_CURRENCY } from "@shared/constants";

export default function DeliveryHistory() {
  const { isAuthenticated, isDeliveryPartner } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Fetch delivery history
  const { data: deliveryHistory, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: [API_ENDPOINTS.DELIVERY_ORDERS + "/history"],
    enabled: isAuthenticated && isDeliveryPartner,
  });

  // Filter orders based on search term and date
  const filteredOrders = deliveryHistory?.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !startDate || 
      new Date(order.createdAt).toISOString().slice(0, 10) >= startDate;
    
    return matchesSearch && matchesDate;
  });

  // Get the selected order
  const selectedOrder = deliveryHistory?.find(order => order.id === selectedOrderId);

  const viewOrderDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsDetailsDialogOpen(true);
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format delivery time in minutes
  const formatDeliveryTime = (minutes?: number) => {
    if (!minutes) return "N/A";
    return `${minutes} min`;
  };

  // Format price from paisa to rupees
  const formatPrice = (paisa: number) => {
    return `${APP_CURRENCY}${(paisa / 100).toFixed(2)}`;
  };

  // Redirect non-delivery users
  if (isAuthenticated && !isDeliveryPartner) {
    navigate("/");
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <DeliveryHeader />
        <main className="container mx-auto px-4 pb-16 flex flex-col items-center justify-center flex-1">
          <div className="text-center p-6 max-w-md mx-auto">
            <span className="material-icons text-neutral-400 text-6xl mb-4">delivery_dining</span>
            <h2 className="text-xl font-semibold mb-2">Delivery Partner Access Required</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Please login with a delivery partner account to access this page.
            </p>
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </main>
        <DeliveryBottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <DeliveryHeader />
      
      <main className="container mx-auto px-4 pb-16">
        <div className="my-6">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
            Delivery History
          </h1>
          
          {/* Search and Filter */}
          <div className="bg-white dark:bg-dark-surface rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-neutral-400 text-sm">search</span>
              </div>
              <Input
                type="text"
                placeholder="Search by order ID or customer"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
          
          {/* Delivery History Table */}
          <div className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600 dark:text-red-400">
                Failed to load delivery history. Please try again.
              </div>
            ) : !filteredOrders?.length ? (
              <div className="p-6 text-center text-neutral-600 dark:text-neutral-400">
                No delivery history found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Delivery Time</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.orderNumber}
                        </TableCell>
                        <TableCell>
                          {formatDate(order.createdAt)}
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatTime(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>{order.user.name || order.user.username}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color as any || "neutral"}
                          >
                            {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatPrice(order.total)}</TableCell>
                        <TableCell>{formatDeliveryTime(order.actualDeliveryTime)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewOrderDetails(order.id)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <DeliveryBottomNavigation />

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
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
                    {formatDate(selectedOrder.createdAt)}
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
                  <p className="font-medium">{formatPrice(selectedOrder.total)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Payment Method</p>
                  <p className="font-medium">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Delivery Time</p>
                  <p className="font-medium">{formatDeliveryTime(selectedOrder.actualDeliveryTime)}</p>
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
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
