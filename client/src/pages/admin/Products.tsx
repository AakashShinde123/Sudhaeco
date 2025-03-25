import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Product, Category } from "@shared/schema";
import { formatCurrency } from "@/utils/format";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type FormMode = "add" | "edit";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  unit: string;
  image: string;
  categoryId: string;
  stock: string;
  isActive: boolean;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  unit: "",
  image: "",
  categoryId: "",
  stock: "",
  isActive: true
};

export default function Products() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Query products and categories
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });
  
  // Filter products
  const filteredProducts = products?.filter(product => {
    if (categoryFilter && product.categoryId.toString() !== categoryFilter) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) || 
        (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Product added",
        description: "Product has been added successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add product",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Product updated",
        description: "Product has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price || !formData.unit || !formData.image || !formData.categoryId || !formData.stock) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare data for API
    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
      unit: formData.unit,
      image: formData.image,
      categoryId: parseInt(formData.categoryId),
      stock: parseInt(formData.stock),
      isActive: formData.isActive
    };
    
    if (formMode === "add") {
      createProductMutation.mutate(productData);
    } else if (formMode === "edit" && selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data: productData });
    }
  };
  
  // Open edit dialog
  const handleEditProduct = (product: Product) => {
    setFormMode("edit");
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      discountPrice: product.discountPrice ? product.discountPrice.toString() : "",
      unit: product.unit,
      image: product.image,
      categoryId: product.categoryId.toString(),
      stock: product.stock.toString(),
      isActive: product.isActive
    });
    setIsDialogOpen(true);
  };
  
  // Open add dialog
  const handleAddProduct = () => {
    setFormMode("add");
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Handle delete product
  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedProduct(null);
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AdminSidebar />
      
      <div className="ml-64 p-6">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Products Management</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your store's products
            </p>
          </div>
          
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </header>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="w-full md:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories?.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
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
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="text-center py-6">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-12 h-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>{product.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {product.unit}
                            </div>
                          </TableCell>
                          <TableCell>
                            {categories?.find(c => c.id === product.categoryId)?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{formatCurrency(product.discountPrice || product.price)}</div>
                            {product.discountPrice && (
                              <div className="text-xs text-gray-500 line-through">
                                {formatCurrency(product.price)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={
                              product.stock <= 5 
                                ? "text-red-500" 
                                : product.stock <= 10 
                                  ? "text-yellow-500" 
                                  : ""
                            }>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
      </div>
      
      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "add" ? "Add New Product" : "Edit Product"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoryId">Category*</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories?.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit*</Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="e.g., 500g, 1kg, 1 liter"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹)*</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discountPrice">Discount Price (₹)</Label>
                    <Input
                      id="discountPrice"
                      name="discountPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="stock">Stock*</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">Image URL*</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-4">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {createProductMutation.isPending || updateProductMutation.isPending 
                  ? "Saving..." 
                  : formMode === "add" ? "Add Product" : "Update Product"
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the product "{selectedProduct?.name}"? 
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
