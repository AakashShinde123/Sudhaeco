import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product, InsertProduct, Category, InsertCategory } from "@shared/schema";

// Get all products with optional filters
export function useProducts(params: { categoryId?: number; featured?: boolean; search?: string; limit?: number; page?: number } = {}) {
  const queryString = new URLSearchParams();
  
  if (params.categoryId) queryString.append("categoryId", params.categoryId.toString());
  if (params.featured !== undefined) queryString.append("featured", params.featured.toString());
  if (params.search) queryString.append("search", params.search);
  if (params.limit) queryString.append("limit", params.limit.toString());
  if (params.page) queryString.append("page", params.page.toString());
  
  const queryKey = queryString.toString() 
    ? `/api/products?${queryString.toString()}`
    : "/api/products";
  
  return useQuery({
    queryKey: [queryKey],
    select: (data) => data as { products: Product[]; total: number },
  });
}

// Get a single product by ID
export function useProduct(id: number | string | undefined) {
  return useQuery({
    queryKey: [`/api/products/${id}`],
    select: (data) => data as Product,
    enabled: !!id,
  });
}

// Create a product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", product);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      return data;
    },
  });
}

// Update a product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, product }: { id: number; product: Partial<InsertProduct> }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, product);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${variables.id}`] });
      return data;
    },
  });
}

// Delete a product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response.json();
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${id}`] });
      return data;
    },
  });
}

// Get all categories
export function useCategories() {
  return useQuery({
    queryKey: ["/api/categories"],
    select: (data) => data as Category[],
  });
}

// Create a category
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", category);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      return data;
    },
  });
}

// Update a category
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, category }: { id: number; category: Partial<InsertCategory> }) => {
      const response = await apiRequest("PATCH", `/api/categories/${id}`, category);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${variables.id}`] });
      return data;
    },
  });
}

// Delete a category
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: [`/api/categories/${id}`] });
      return data;
    },
  });
}
