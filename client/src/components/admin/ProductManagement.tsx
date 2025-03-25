import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Product, Category, insertProductSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash, Plus, Search } from "lucide-react";

// Extend the product schema for the form
const productFormSchema = insertProductSchema.extend({
  id: z.number().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  
  // Forms
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      salePrice: 0,
      image: "",
      categoryId: 1,
      inStock: true,
      quantity: 0,
      unit: "piece"
    }
  });
  
  // Queries
  const { data: products = [], isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Mutations
  const createProduct = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product created",
        description: "The product has been created successfully",
      });
      setOpenProductDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormValues }) => {
      const response = await apiRequest("PATCH", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully",
      });
      setOpenProductDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully",
      });
      setOpenDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    form.reset({
      name: "",
      description: "",
      price: 0,
      salePrice: 0,
      image: "",
      categoryId: categories[0]?.id || 1,
      inStock: true,
      quantity: 0,
      unit: "piece"
    });
    setOpenProductDialog(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    form.reset({
      ...product,
      price: product.price,
      salePrice: product.salePrice || 0
    });
    setOpenProductDialog(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };
  
  const onSubmit = (data: ProductFormValues) => {
    // Ensure numeric values
    const numericData = {
      ...data,
      price: Number(data.price),
      salePrice: data.salePrice ? Number(data.salePrice) : null,
      quantity: Number(data.quantity),
      categoryId: Number(data.categoryId)
    };
    
    if (selectedProduct) {
      updateProduct.mutate({ id: selectedProduct.id, data: numericData });
    } else {
      createProduct.mutate(numericData);
    }
  };
  
  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProduct.mutate(selectedProduct.id);
    }
  };
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Apply search filter
    const matchesSearch = !search || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
    
    // Apply category filter
    const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  // Format price
  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(2)}`;
  };
  
  return (
    <div className="p-6">
      <Tabs defaultValue="inventory">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <Button onClick={handleCreateProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Product Inventory</CardTitle>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <select 
                    className="rounded-md border border-input bg-background px-3 py-2"
                    value={categoryFilter?.toString() || ""}
                    onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {categories.find(c => c.id === product.categoryId)?.name || `Category ${product.categoryId}`}
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          {product.salePrice ? formatPrice(product.salePrice) : "—"}
                        </TableCell>
                        <TableCell>{product.quantity} {product.unit}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product)}>
                              <Trash className="h-4 w-4" />
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
        </TabsContent>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Categories</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => {
                      const productCount = products.filter(p => p.categoryId === category.id).length;
                      return (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div 
                                className="w-6 h-6 rounded-full mr-2" 
                                style={{ backgroundColor: category.color }}
                              />
                              {category.color}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <i className={`${category.icon} text-lg`} style={{ color: category.color }}></i>
                              <span className="ml-2">{category.icon}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              category.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {category.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>{productCount}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Product Form Dialog */}
      <Dialog open={openProductDialog} onOpenChange={setOpenProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? `Edit Product: ${selectedProduct.name}` : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
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
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
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
                      <Textarea placeholder="Enter product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (in paise)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price (in paise, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter sale price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter quantity" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                          {...field}
                        >
                          <option value="piece">Piece</option>
                          <option value="kg">Kilogram (kg)</option>
                          <option value="g">Gram (g)</option>
                          <option value="litre">Litre</option>
                          <option value="ml">Millilitre (ml)</option>
                          <option value="dozen">Dozen</option>
                          <option value="pack">Pack</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter image URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">In Stock</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Whether this product is currently available for purchase
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
                <Button type="button" variant="outline" onClick={() => setOpenProductDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedProduct ? "Update Product" : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>Are you sure you want to delete the product "{selectedProduct?.name}"?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
