import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertCategorySchema } from "@shared/schema";

// Define validation schemas
const categoryIdSchema = z.object({
  id: z.coerce.number().positive(),
});

const categoriesController = {
  /**
   * Get all categories
   */
  getAllCategories: async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories. Please try again.",
      });
    }
  },

  /**
   * Get a category by ID
   */
  getCategoryById: async (req: Request, res: Response) => {
    try {
      const { id } = categoryIdSchema.parse({ id: req.params.id });
      
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      console.error("Error getting category by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch category. Please try again.",
      });
    }
  },

  /**
   * Get products by category ID
   */
  getCategoryProducts: async (req: Request, res: Response) => {
    try {
      const { id } = categoryIdSchema.parse({ id: req.params.id });
      
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      
      const products = await storage.getProductsByCategory(id);
      
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error getting category products:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch category products. Please try again.",
      });
    }
  },

  /**
   * Create a new category
   */
  createCategory: async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      
      const newCategory = await storage.createCategory(categoryData);
      
      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: newCategory,
      });
    } catch (error) {
      console.error("Error creating category:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create category. Please try again.",
      });
    }
  },

  /**
   * Update an existing category
   */
  updateCategory: async (req: Request, res: Response) => {
    try {
      const { id } = categoryIdSchema.parse({ id: req.params.id });
      
      // Allow partial updates
      const updateData = insertCategorySchema.partial().parse(req.body);
      
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      
      const updatedCategory = await storage.updateCategory(id, updateData);
      
      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update category. Please try again.",
      });
    }
  },

  /**
   * Delete a category
   */
  deleteCategory: async (req: Request, res: Response) => {
    try {
      const { id } = categoryIdSchema.parse({ id: req.params.id });
      
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      
      // Check if category has products
      const products = await storage.getProductsByCategory(id);
      
      if (products.length > 0) {
        // Either prevent deletion or update products to remove category
        // For now, we'll just set categoryId to null for associated products
        await Promise.all(
          products.map(product => 
            storage.updateProduct(product.id, { categoryId: null })
          )
        );
      }
      
      await storage.deleteCategory(id);
      
      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete category. Please try again.",
      });
    }
  },

  /**
   * Get categories with product count stats
   */
  getCategoriesWithStats: async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      
      // Get product count for each category
      const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          const products = await storage.getProductsByCategory(category.id);
          return {
            ...category,
            productCount: products.length,
          };
        })
      );
      
      return res.status(200).json(categoriesWithStats);
    } catch (error) {
      console.error("Error getting categories with stats:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch categories. Please try again.",
      });
    }
  },
};

export default categoriesController;
