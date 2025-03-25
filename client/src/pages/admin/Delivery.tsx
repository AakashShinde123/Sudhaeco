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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Phone, Star, Bike } from "lucide-react";
import { Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Mock delivery partners
const deliveryPartners = [
  { id: 1, name: "Rahul Kumar", phone: "+91 9876543210", rating: 4.8, status: "online", orderCount: 12, completedToday: 8, avgDeliveryTime: 9.2 },
  { id: 2, name: "Priya Sharma", phone: "+91 9876543211", rating: 4.9, status: "online", orderCount: 8, completedToday: 5, avgDeliveryTime: 8.5 },
  { id: 3, name: "Amit Patel", phone: "+91 9876543212", rating: 4.7, status: "offline", orderCount: 15, completedToday: 0, avgDeliveryTime: 9.8 },
  { id: 4, name: "Neha Gupta", phone: "+91 9876543213", rating: 4.6, status: "online", orderCount: 10, completedToday: 6, avgDeliveryTime: 10.2 },
  { id: 5, name: "Vijay Singh", phone: "+91 9876543214", rating: 4.5, status: "offline", orderCount: 18, completedToday: 0, avgDeliveryTime: 9.5 },
];

interface OrderWithDetails extends Order {
  items: any[];
}

export default function Delivery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  // Query pending/packed orders that need delivery assignment
  const { data: orders, isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ['/api/orders'],
    select: (data) => data.filter(order => ['packed', 'preparing'].includes(order.status) && !order.deliveryPartnerId)
  });
  
  // Filter delivery partners
  const filteredPartners = deliveryPartners.filter(partner => {
    if (statusFilter && partner.status !== statusFilter) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        partner.name.toLowerCase().includes(query) || 
        partner.phone.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Filter orders
  const filteredOrders = orders?.filter(order => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return order.id.toString().includes(query) || order.userId.toString().includes(query);
    }
    return true;
  });
  
  // Assign delivery partner mutation
  const assignDeliveryMutation = useMutation({
    mutationFn: async ({ orderId, partnerId }: { orderId: number, partnerId: number }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}`, {
        deliveryPartnerId: partnerId,
        status: "out_for_delivery"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedPartner(null);
      toast({
        title: "Delivery partner assigned",
        description: "Order has been assigned to a delivery partner successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign delivery partner",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleAssignDelivery = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };
  
  const confirmAssignment = () => {
    if (selectedOrder && selectedPartner) {
      assignDeliveryMutation.mutate({
        orderId: selectedOrder.id,
        partnerId: selectedPartner
      });
    } else {
      toast({
        title: "Selection required",
        description: "Please select a delivery partner to assign",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AdminSidebar />
      
      <div className="ml-64 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Delivery Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage delivery partners and track deliveries
          </p>
        </header>
        
        {/* Delivery Partners Section */}
        <div className="mb-8">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search delivery partners..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delivery Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Today's Deliveries</TableHead>
                      <TableHead>Avg. Delivery Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No delivery partners found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPartners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell>{partner.phone}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                              <span>{partner.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={partner.status === "online" ? "success" : "secondary"}>
                              {partner.status === "online" ? "Online" : "Offline"}
                            </Badge>
                          </TableCell>
                          <TableCell>{partner.completedToday}/{partner.orderCount}</TableCell>
                          <TableCell>{partner.avgDeliveryTime} min</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pending Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Pending Delivery Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">Loading orders...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                          No pending orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders?.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.id.toString().padStart(4, '0')}
                          </TableCell>
                          <TableCell>User #{order.userId}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-1 flex-shrink-0" />
                              <span className="truncate">{order.address}</span>
                            </div>
                          </TableCell>
                          <TableCell>{order.items.length} items</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => handleAssignDelivery(order)}
                            >
                              <Bike className="mr-2 h-4 w-4" />
                              Assign
                            </Button>
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
      </div>
      
      {/* Assign Delivery Partner Dialog */}
      {selectedOrder && (
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Delivery Partner</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">
                <span className="font-medium">Order:</span> #{selectedOrder.id.toString().padStart(4, '0')}
              </p>
              
              <p className="mb-4">
                <span className="font-medium">Delivery Address:</span> {selectedOrder.address}
              </p>
              
              <div className="mb-6">
                <Label htmlFor="deliveryPartner" className="mb-2 block">Select Delivery Partner</Label>
                <Select value={selectedPartner?.toString() || ""} onValueChange={(value) => setSelectedPartner(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {deliveryPartners
                        .filter(partner => partner.status === "online")
                        .map(partner => (
                          <SelectItem key={partner.id} value={partner.id.toString()}>
                            <div className="flex items-center">
                              <span>{partner.name}</span>
                              <div className="ml-2 flex items-center text-xs text-gray-500">
                                <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                <span>{partner.rating}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAssignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmAssignment}
                disabled={assignDeliveryMutation.isPending || !selectedPartner}
              >
                {assignDeliveryMutation.isPending ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
