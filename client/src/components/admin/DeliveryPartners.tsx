import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@shared/schema";
import { Pencil, Plus, MapPin, Phone, Bike, Package, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schema
const deliveryPartnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  address: z.string().min(1, "Address is required"),
});

type DeliveryPartnerFormValues = z.infer<typeof deliveryPartnerSchema>;

export function DeliveryPartners() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    userId: number;
  } | null>(null);
  
  // Form
  const form = useForm<DeliveryPartnerFormValues>({
    resolver: zodResolver(deliveryPartnerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
    }
  });
  
  // Fetch delivery partners
  const { data: deliveryPartners = [], isLoading: isPartnersLoading } = useQuery<User[]>({
    queryKey: ['/api/delivery-partners'],
  });
  
  // Fetch active delivery locations
  const { data: activePartners = [], isLoading: isActiveLoading } = useQuery({
    queryKey: ['/api/delivery-partners/available'],
  });
  
  // Fetch orders assigned to delivery partners
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });
  
  // Create delivery partner mutation
  const createPartner = useMutation({
    mutationFn: async (data: { phone: string; name?: string; email?: string; address?: string; role: string }) => {
      const response = await apiRequest("POST", "/api/auth/send-otp", { phone: data.phone });
      await response.json();
      
      // Create user directly (in a real app, would need proper auth flow)
      const userResponse = await apiRequest("POST", "/api/users", {
        phone: data.phone,
        name: data.name,
        email: data.email,
        address: data.address,
        role: data.role
      });
      
      return userResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delivery-partners'] });
      toast({
        title: "Delivery partner created",
        description: "The delivery partner has been added successfully",
      });
      setIsPartnerDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create delivery partner",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update delivery partner mutation
  const updatePartner = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delivery-partners'] });
      toast({
        title: "Delivery partner updated",
        description: "The delivery partner has been updated successfully",
      });
      setIsPartnerDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update delivery partner",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle opening create/edit dialog
  const handleOpenPartnerDialog = (partner?: User) => {
    if (partner) {
      setSelectedPartner(partner);
      form.reset({
        name: partner.name || "",
        phone: partner.phone,
        email: partner.email || "",
        address: partner.address || "",
      });
    } else {
      setSelectedPartner(null);
      form.reset({
        name: "",
        phone: "",
        email: "",
        address: "",
      });
    }
    setIsPartnerDialogOpen(true);
  };
  
  // Handle opening map dialog
  const handleOpenMapDialog = (partner: User) => {
    // Get location from activePartners
    const location = activePartners.find(p => p.userId === partner.id);
    
    if (location) {
      setSelectedLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        userId: partner.id
      });
    } else {
      // Default coordinates (Bengaluru)
      setSelectedLocation({
        latitude: 12.9716,
        longitude: 77.5946,
        userId: partner.id
      });
    }
    
    setMapDialogOpen(true);
  };
  
  // Handle form submission
  const onSubmit = (data: DeliveryPartnerFormValues) => {
    if (selectedPartner) {
      updatePartner.mutate({
        id: selectedPartner.id,
        data: {
          ...data,
          role: "delivery"
        }
      });
    } else {
      createPartner.mutate({
        ...data,
        role: "delivery"
      });
    }
  };
  
  // Calculate stats
  const activePartnersCount = activePartners.length;
  
  // Count assigned orders for each delivery partner
  const getAssignedOrders = (partnerId: number) => {
    return orders.filter(order => 
      order.deliveryPartnerId === partnerId && 
      order.status !== "delivered"
    ).length;
  };
  
  // Check if partner is available
  const isPartnerAvailable = (partnerId: number) => {
    return activePartners.some(p => p.userId === partnerId);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Delivery Partners</h2>
        <Button onClick={() => handleOpenPartnerDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryPartners.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePartnersCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders in Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order.status === "shipped").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivered Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => {
                const today = new Date();
                const orderDate = new Date(order.createdAt);
                return order.status === "delivered" && 
                  orderDate.getDate() === today.getDate() &&
                  orderDate.getMonth() === today.getMonth() &&
                  orderDate.getFullYear() === today.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Delivery Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">
                      {partner.name || `Partner ${partner.id}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-500" />
                        {partner.phone}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {partner.address || "Not set"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPartnerAvailable(partner.id) ? "success" : "secondary"}>
                        {isPartnerAvailable(partner.id) ? (
                          <span className="flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Available
                          </span>
                        ) : "Offline"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1 text-gray-500" />
                        {getAssignedOrders(partner.id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenPartnerDialog(partner)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenMapDialog(partner)}>
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Create/Edit Partner Dialog */}
      <Dialog open={isPartnerDialogOpen} onOpenChange={setIsPartnerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPartner ? "Edit Delivery Partner" : "Add Delivery Partner"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPartnerDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedPartner ? "Update Partner" : "Add Partner"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Partner Location</DialogTitle>
          </DialogHeader>
          
          <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
              <p>Location: {selectedLocation?.latitude}, {selectedLocation?.longitude}</p>
              <p className="text-sm text-gray-500 mt-2">
                Map integration would display this location.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setMapDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
