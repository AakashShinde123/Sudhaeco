import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Promo } from "@shared/schema";
import { formatPrice } from "@/lib/utils";

// Form validation schema
const promoFormSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code must be at most 20 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive("Discount value must be positive"),
  minOrderValue: z.coerce.number().nonnegative("Minimum order value must be non-negative"),
  maxDiscountAmount: z.coerce.number().nonnegative("Maximum discount amount must be non-negative").optional().nullable(),
  validFrom: z.coerce.date(),
  validTo: z.coerce.date(),
  isActive: z.boolean().default(true),
}).refine(data => {
  return data.validFrom < data.validTo;
}, {
  message: "End date must be after start date",
  path: ["validTo"]
});

type PromoFormValues = z.infer<typeof promoFormSchema>;

export default function Promotions() {
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<Promo | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Setup form with validation
  const form = useForm<PromoFormValues>({
    resolver: zodResolver(promoFormSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 0,
      maxDiscountAmount: null,
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
    }
  });

  // Fetch promos
  const { data: promos, isLoading } = useQuery({
    queryKey: ["/api/promos"],
    select: (data) => data as Promo[],
  });

  // Create promo
  const createPromoMutation = useMutation({
    mutationFn: async (promo: PromoFormValues) => {
      const response = await apiRequest("POST", "/api/promos", promo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promos"] });
      setShowPromoForm(false);
      toast({
        title: "Promo created",
        description: "Promo code has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create promo code. It might already exist.",
        variant: "destructive",
      });
    },
  });

  // Update promo
  const updatePromoMutation = useMutation({
    mutationFn: async ({ id, promo }: { id: number; promo: Partial<PromoFormValues> }) => {
      const response = await apiRequest("PATCH", `/api/promos/${id}`, promo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promos"] });
      setShowPromoForm(false);
      setEditingPromo(null);
      toast({
        title: "Promo updated",
        description: "Promo code has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive",
      });
    },
  });

  // Delete promo
  const deletePromoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/promos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promos"] });
      setShowDeleteConfirm(false);
      setPromoToDelete(null);
      toast({
        title: "Promo deleted",
        description: "Promo code has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete promo code",
        variant: "destructive",
      });
    },
  });

  // Toggle promo active status
  const togglePromoStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/promos/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promos"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update promo status",
        variant: "destructive",
      });
    },
  });

  const handleAddPromo = () => {
    form.reset({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 0,
      maxDiscountAmount: null,
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
    });
    setEditingPromo(null);
    setShowPromoForm(true);
  };

  const handleEditPromo = (promo: Promo) => {
    // Format dates for the form
    const validFrom = new Date(promo.validFrom);
    const validTo = new Date(promo.validTo);

    form.reset({
      ...promo,
      validFrom,
      validTo,
    });
    setEditingPromo(promo);
    setShowPromoForm(true);
  };

  const handleDeletePromo = (promo: Promo) => {
    setPromoToDelete(promo);
    setShowDeleteConfirm(true);
  };

  const handleToggleStatus = (promo: Promo) => {
    togglePromoStatusMutation.mutate({ 
      id: promo.id, 
      isActive: !promo.isActive 
    });
  };

  const onSubmit = (data: PromoFormValues) => {
    if (editingPromo) {
      updatePromoMutation.mutate({ id: editingPromo.id, promo: data });
    } else {
      createPromoMutation.mutate(data);
    }
  };

  const confirmDeletePromo = () => {
    if (promoToDelete) {
      deletePromoMutation.mutate(promoToDelete.id);
    }
  };

  // Check if promo is expired
  const isExpired = (validTo: string | Date) => {
    return new Date(validTo) < new Date();
  };

  // Format date range for display
  const formatDateRange = (from: string | Date, to: string | Date) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    return `${fromDate.toLocaleDateString('en-IN')} - ${toDate.toLocaleDateString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary mb-2"></i>
          <p>Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <Button onClick={handleAddPromo} className="bg-primary">
          <i className="ri-coupon-line mr-2"></i>
          Create Promo Code
        </Button>
      </div>

      {/* Promos Table */}
      {promos && promos.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Minimum Order</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-bold uppercase">{promo.code}</TableCell>
                  <TableCell className="max-w-md truncate">{promo.description}</TableCell>
                  <TableCell>
                    {promo.discountType === "percentage" ? (
                      <span>{promo.discountValue}%</span>
                    ) : (
                      <span>{formatPrice(promo.discountValue)}</span>
                    )}
                    {promo.maxDiscountAmount && (
                      <div className="text-xs text-gray-500">
                        Up to {formatPrice(promo.maxDiscountAmount)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {promo.minOrderValue > 0 ? formatPrice(promo.minOrderValue) : "None"}
                  </TableCell>
                  <TableCell>
                    <div className={isExpired(promo.validTo) ? "text-red-500" : ""}>
                      {formatDateRange(promo.validFrom, promo.validTo)}
                    </div>
                    {isExpired(promo.validTo) && (
                      <div className="text-xs text-red-500">Expired</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={promo.isActive}
                      onCheckedChange={() => handleToggleStatus(promo)}
                      disabled={togglePromoStatusMutation.isPending}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <i className="ri-more-2-fill"></i>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPromo(promo)}>
                          <i className="ri-pencil-line mr-2"></i> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeletePromo(promo)} className="text-red-600">
                          <i className="ri-delete-bin-line mr-2"></i> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <i className="ri-coupon-line text-gray-300 text-5xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Promo Codes Found</h2>
          <p className="text-gray-500 mb-4">Create your first promo code to offer discounts to your customers</p>
          <Button onClick={handleAddPromo} className="bg-primary">
            <i className="ri-coupon-line mr-2"></i>
            Create Promo Code
          </Button>
        </div>
      )}

      {/* Promo Form Dialog */}
      <Dialog open={showPromoForm} onOpenChange={setShowPromoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPromo ? "Edit Promo Code" : "Create Promo Code"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. WELCOME10" 
                          {...field} 
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 10% off on your first order" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          placeholder={form.watch("discountType") === "percentage" ? "e.g. 10" : "e.g. 100"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minOrderValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Order Value (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="e.g. 200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("discountType") === "percentage" && (
                <FormField
                  control={form.control}
                  name="maxDiscountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Discount Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                          placeholder="Leave blank for no limit"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid To</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <p className="text-sm text-gray-500">
                        Make this promo code available for use
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createPromoMutation.isPending || updatePromoMutation.isPending}
                >
                  {(createPromoMutation.isPending || updatePromoMutation.isPending) ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      {editingPromo ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingPromo ? "Update Promo" : "Create Promo"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete the promo code <span className="font-bold uppercase">{promoToDelete?.code}</span>?</p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. Users will no longer be able to use this promo code.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePromo}
              disabled={deletePromoMutation.isPending}
            >
              {deletePromoMutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Deleting...
                </>
              ) : (
                "Delete Promo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
