import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Order, InsertOrder } from "@shared/schema";

// Get all orders
export function useOrders(params: { status?: string; limit?: number; page?: number } = {}) {
  return useQuery({
    queryKey: ["/api/orders", params],
    select: (data) => data as { orders: Order[]; total: number },
  });
}

// Get single order by ID
export function useOrder(id: number | string) {
  return useQuery({
    queryKey: [`/api/orders/${id}`],
    select: (data) => data as Order,
    enabled: !!id,
  });
}

// Get user orders
export function useUserOrders(userId: number | undefined) {
  return useQuery({
    queryKey: ["/api/orders/user", userId],
    select: (data) => data as Order[],
    enabled: !!userId,
  });
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      return data;
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${variables.id}`] });
      return data;
    },
  });
}

// Assign delivery partner
export function useAssignDeliveryPartner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, deliveryPartnerId }: { orderId: number; deliveryPartnerId: number }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/assign`, { deliveryPartnerId });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${variables.orderId}`] });
      return data;
    },
  });
}

// Cancel order
export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/cancel`);
      return response.json();
    },
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
      return data;
    },
  });
}
