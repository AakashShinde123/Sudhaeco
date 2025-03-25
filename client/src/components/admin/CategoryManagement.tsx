import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Category, InsertCategory } from "@shared/schema";
import { CategoryStats } from "@shared/types";
import { API_ENDPOINTS, CATEGORY_ICONS } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";

export default function CategoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<InsertCategory>({
    name: "",
    icon: "shopping_basket",
    color: "#1e88e5"
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Fetch categories with stats
  const { data: categoryStats, isLoading, error } = useQuery<CategoryStats[]>({
    queryKey: [API_ENDPOINTS.ADMIN_CATEGORIES],
  });

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (category: InsertCategory) => {
      const res = await apiRequest("POST", API_ENDPOINTS.CATEGORIES, category);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Category Added",
        description: "The category has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Add Category",
        description: "There was an error adding the category. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Edit category mutation
  const editCategoryMutation = useMutation({
    mutationFn: async ({ id, category }: { id: number; category: InsertCategory }) => {
      const res = await apiRequest("PATCH", `${API_ENDPOINTS.CATEGORIES}/${id}`, category);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Category Updated",
        description: "The category has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Update Category",
        description: "There was an error updating the category. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `${API_ENDPOINTS.CATEGORIES}/${id}`, null);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.ADMIN_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.CATEGORIES] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Category Deleted",
        description: "The category has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Delete Category",
        description: "There was an error deleting the category. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setCategoryForm({
      name: "",
      icon: "shopping_basket",
      color: "#1e88e5"
    });
  };

  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    addCategoryMutation.mutate(categoryForm);
  };

  const handleEditCategory = () => {
    if (!selectedCategoryId || !categoryForm.name.trim()) return;
    editCategoryMutation.mutate({ id: selectedCategoryId, category: categoryForm });
  };

  const handleDeleteCategory = () => {
    if (!selectedCategoryId) return;
    deleteCategoryMutation.mutate(selectedCategoryId);
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setIsDeleteDialogOpen(true);
  };

  // Get available icons for selection
  const availableIcons = Object.values(CATEGORY_ICONS).map(c => c.icon);

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins font-semibold text-lg">Category Management</h2>
        <Button 
          className="flex items-center"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <span className="material-icons text-sm mr-1">add</span>
          Add Category
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : error || !categoryStats ? (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm">
          Failed to load categories. Please try again.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categoryStats.map(category => (
            <div 
              key={category.id} 
              className="bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border p-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-10 w-10 rounded-md flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${category.color}20`, // 20% opacity 
                    }}
                  >
                    <span 
                      className="material-icons"
                      style={{ color: category.color }}
                    >
                      {category.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-200">{category.name}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{category.productCount} products</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border"
                    onClick={() => openEditDialog(category as any)}
                  >
                    <span className="material-icons text-neutral-600 dark:text-neutral-400 text-sm">edit</span>
                  </button>
                  <button 
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border"
                    onClick={() => openDeleteDialog(category.id)}
                  >
                    <span className="material-icons text-neutral-600 dark:text-neutral-400 text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g. Fruits & Vegetables"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`p-2 border rounded-md flex items-center justify-center ${
                      categoryForm.icon === icon 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-neutral-200 dark:border-dark-border'
                    }`}
                    onClick={() => setCategoryForm({ ...categoryForm, icon })}
                  >
                    <span 
                      className="material-icons text-neutral-600 dark:text-neutral-400"
                      style={{ color: categoryForm.icon === icon ? categoryForm.color : undefined }}
                    >
                      {icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="color" className="text-sm font-medium">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  id="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-10 h-10 p-1"
                />
                <Input
                  type="text"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory}
              disabled={addCategoryMutation.isPending}
            >
              {addCategoryMutation.isPending ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Category Name
              </label>
              <Input
                id="edit-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g. Fruits & Vegetables"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`p-2 border rounded-md flex items-center justify-center ${
                      categoryForm.icon === icon 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-neutral-200 dark:border-dark-border'
                    }`}
                    onClick={() => setCategoryForm({ ...categoryForm, icon })}
                  >
                    <span 
                      className="material-icons text-neutral-600 dark:text-neutral-400"
                      style={{ color: categoryForm.icon === icon ? categoryForm.color : undefined }}
                    >
                      {icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-color" className="text-sm font-medium">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  id="edit-color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="w-10 h-10 p-1"
                />
                <Input
                  type="text"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditCategory}
              disabled={editCategoryMutation.isPending}
            >
              {editCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this category? This action cannot be undone.</p>
            <p className="text-sm text-red-500 mt-2">
              Warning: Deleting a category may affect products assigned to it.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
