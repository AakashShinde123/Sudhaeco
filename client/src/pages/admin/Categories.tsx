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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type FormMode = "add" | "edit";

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  name: "",
  icon: "ri-shopping-basket-2-line",
  color: "primary",
  isActive: true
};

// Available icon options
const iconOptions = [
  { value: "ri-shopping-basket-2-line", label: "Basket" },
  { value: "ri-plant-line", label: "Plant" },
  { value: "ri-cup-line", label: "Cup" },
  { value: "ri-restaurant-line", label: "Restaurant" },
  { value: "ri-bread-line", label: "Bread" },
  { value: "ri-store-2-line", label: "Store" },
  { value: "ri-ice-cream-line", label: "Ice Cream" },
  { value: "ri-medicine-bottle-line", label: "Bottle" }
];

// Available color options
const colorOptions = [
  { value: "primary", label: "Primary" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
  { value: "yellow", label: "Yellow" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "indigo", label: "Indigo" }
];

// Icon mapping to emojis for display
const iconMap: Record<string, string> = {
  "ri-shopping-basket-2-line": "🍎",
  "ri-plant-line": "🥬",
  "ri-cup-line": "🥛",
  "ri-restaurant-line": "🥩",
  "ri-bread-line": "🍞",
  "ri-store-2-line": "🥫",
  "ri-ice-cream-line": "🍦",
  "ri-medicine-bottle-line": "🧹"
};

// Color mapping to Tailwind classes
const colorMap: Record<string, string> = {
  "primary": "bg-primary-100 dark:bg-primary-900 text-primary",
  "green": "bg-green-100 dark:bg-green-900 text-green-500",
  "blue": "bg-blue-100 dark:bg-blue-900 text-blue-500",
  "red": "bg-red-100 dark:bg-red-900 text-red-500",
  "yellow": "bg-yellow-100 dark:bg-yellow-900 text-yellow-500",
  "purple": "bg-purple-100 dark:bg-purple-900 text-purple-500",
  "pink": "bg-pink-100 dark:bg-pink-900 text-pink-500",
  "indigo": "bg-indigo-100 dark:bg-indigo-900 text-indigo-500"
};

export default function Categories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Query categories
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories']
  });
  
  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Category added",
        description: "Category has been added successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add category",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: CategoryFormData }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Category updated",
        description: "Category has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/categories/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete category",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!formData.name || !formData.icon || !formData.color) {
      toast({
        title: "Validation error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (formMode === "add") {
      createCategoryMutation.mutate(formData);
    } else if (formMode === "edit" && selectedCategory) {
      updateCategoryMutation.mutate({ id: selectedCategory.id, data: formData });
    }
  };
  
  // Open edit dialog
  const handleEditCategory = (category: Category) => {
    setFormMode("edit");
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive
    });
    setIsDialogOpen(true);
  };
  
  // Open add dialog
  const handleAddCategory = () => {
    setFormMode("add");
    resetForm();
    setIsDialogOpen(true);
  };
  
  // Handle delete category
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedCategory(null);
  };
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AdminSidebar />
      
      <div className="ml-64 p-6">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Categories Management</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your product categories
            </p>
          </div>
          
          <Button onClick={handleAddCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </header>
        
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">Loading categories...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Icon</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>
                            <div className={`w-10 h-10 rounded-full ${colorMap[category.color]} flex items-center justify-center text-xl`}>
                              {iconMap[category.icon] || "🛒"}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {/* In a real app, we would fetch and display the product count */}
                            {Math.floor(Math.random() * 20)} products
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteClick(category)}
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
      
      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "add" ? "Add New Category" : "Edit Category"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Category Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="icon">Icon*</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => handleSelectChange("icon", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <span className="mr-2">{iconMap[option.value]}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="color">Color*</Label>
                <Select 
                  value={formData.color} 
                  onValueChange={(value) => handleSelectChange("color", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div className={`w-4 h-4 ${colorMap[option.value]} rounded-full mr-2`}></div>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="isActive">Active</Label>
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
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending 
                  ? "Saving..." 
                  : formMode === "add" ? "Add Category" : "Update Category"
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
            Are you sure you want to delete the category "{selectedCategory?.name}"? 
            This may affect products assigned to this category.
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
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
