import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertProductSchema } from "@shared/schema";

// Define validation schemas
const productIdSchema = z.object({
  id: z.coerce.number().positive(),
});

const searchQuerySchema = z.object({
  query: z.string().min(1).optional(),
  categoryId: z.coerce.number().positive().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
  inStock: z.coerce.boolean().optional(),
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().optional(),
});

const productsController = {
  /**
   * Get all products with optional filtering
   */
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const query = searchQuerySchema.parse({
        query: req.query.query as string,
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
        sort: req.query.sort as string,
        inStock: req.query.inStock ? req.query.inStock === "true" : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      });

      const products = await storage.getProducts({
        search: query.query,
        categoryId: query.categoryId,
        sort: query.sort,
        inStock: query.inStock,
        page: query.page,
        limit: query.limit,
      });

      return res.status(200).json(products);
    } catch (error) {
      console.error("Error getting products:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products. Please try again.",
      });
    }
  },

  /**
   * Search products by query string
   */
  searchProducts: async (req: Request, res: Response) => {
    try {
      const query = z.string().parse(req.query.q || "");
      
      if (!query || query.length < 2) {
        return res.status(200).json([]);
      }

      const products = await storage.searchProducts(query);
      
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error searching products:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to search products. Please try again.",
      });
    }
  },

  /**
   * Get a product by ID
   */
  getProductById: async (req: Request, res: Response) => {
    try {
      const { id } = productIdSchema.parse({ id: req.params.id });
      
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      console.error("Error getting product by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch product. Please try again.",
      });
    }
  },

  /**
   * Create a new product
   */
  createProduct: async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      const newProduct = await storage.createProduct(productData);
      
      return res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create product. Please try again.",
      });
    }
  },

  /**
   * Update an existing product
   */
  updateProduct: async (req: Request, res: Response) => {
    try {
      const { id } = productIdSchema.parse({ id: req.params.id });
      
      // Allow partial updates
      const updateData = insertProductSchema.partial().parse(req.body);
      
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      
      const updatedProduct = await storage.updateProduct(id, updateData);
      
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update product. Please try again.",
      });
    }
  },

  /**
   * Delete a product
   */
  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { id } = productIdSchema.parse({ id: req.params.id });
      
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      
      await storage.deleteProduct(id);
      
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete product. Please try again.",
      });
    }
  },
};

export default productsController;
