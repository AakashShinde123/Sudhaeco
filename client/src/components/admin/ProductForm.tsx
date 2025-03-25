import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useProducts";
import { insertProductSchema, Product } from "@shared/schema";
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
import { Switch } from "@/components/ui/switch";

// Extend product schema with validation
const productFormSchema = insertProductSchema.extend({
  price: z.number().min(0.01, "Price must be greater than 0"),
  discountPrice: z.number().optional().nullable(),
  stock: z.number().min(0, "Stock cannot be negative"),
}).refine(
  (data) => !data.discountPrice || data.discountPrice < data.price,
  {
    message: "Discount price must be less than regular price",
    path: ["discountPrice"],
  }
);

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
  isSubmitting: boolean;
}

export default function ProductForm({ product, onSubmit, isSubmitting }: ProductFormProps) {
  const { toast } = useToast();
  const { data: categories } = useCategories();
  
  const defaultValues: Partial<ProductFormValues> = {
    name: "",
    description: "",
    price: 0,
    discountPrice: null,
    imageUrl: "",
    categoryId: 0,
    stock: 0,
    unit: "item",
    isActive: true,
    isFeatured: false,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? {
      ...defaultValues,
      ...product,
    } : defaultValues,
  });

  // Update form when product changes
  useEffect(() => {
    if (product) {
      Object.entries(product).forEach(([key, value]) => {
        if (key in form.getValues()) {
          form.setValue(key as any, value as any);
        }
      });
    }
  }, [product, form]);

  const handleSubmit = (data: ProductFormValues) => {
    if (!data.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter product name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                <Textarea
                  {...field}
                  placeholder="Enter product description"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    min={0}
                    step={0.01}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => 
                      field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                    }
                    min={0}
                    step={0.01}
                    placeholder="Optional"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    min={0}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="item">Item</SelectItem>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="l">Liter (l)</SelectItem>
                    <SelectItem value="ml">Milliliter (ml)</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter image URL" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-gray-500">
                    Make this product available for purchase
                  </div>
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

          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Featured Product</FormLabel>
                  <div className="text-sm text-gray-500">
                    Show this product in featured sections
                  </div>
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
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                {product ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{product ? "Update Product" : "Create Product"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
