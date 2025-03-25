import { Request, Response } from "express";
import { storage } from "../storage";
import { insertCategorySchema, insertProductSchema, insertCartSchema, insertPromoSchema } from "@shared/schema";

// Category Controllers
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await storage.getCategories();
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to get categories" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const categoryData = insertCategorySchema.parse(req.body);
    const category = await storage.createCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(400).json({ message: "Failed to create category" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const categoryData = insertCategorySchema.partial().parse(req.body);
    
    const updatedCategory = await storage.updateCategory(id, categoryData);
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(400).json({ message: "Failed to update category" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const success = await storage.deleteCategory(id);
    
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

// Product Controllers
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const featured = req.query.featured ? req.query.featured === 'true' : undefined;
    const search = req.query.search as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    
    const { products, total } = await storage.getProducts({ categoryId, featured, search, limit, page });
    res.json({ products, total });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to get products" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const product = await storage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Failed to get product" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const productData = insertProductSchema.parse(req.body);
    
    // Validate that category exists
    const category = await storage.getCategoryById(productData.categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }
    
    const product = await storage.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: "Failed to create product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const productData = insertProductSchema.partial().parse(req.body);
    
    // If categoryId is provided, validate that it exists
    if (productData.categoryId) {
      const category = await storage.getCategoryById(productData.categoryId);
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }
    
    const updatedProduct = await storage.updateProduct(id, productData);
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const success = await storage.deleteProduct(id);
    
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

// Cart Controllers
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { items, total } = await storage.getCartByUserId(userId);
    res.json({ items, total });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to get cart" });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists
    const product = await storage.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Validate product is active
    if (!product.isActive) {
      return res.status(400).json({ message: "Product is currently unavailable" });
    }
    
    // Validate sufficient stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    
    const cartItem = await storage.addToCart({
      userId,
      productId,
      quantity
    });
    
    // Return updated cart
    const { items, total } = await storage.getCartByUserId(userId);
    res.status(201).json({ items, total });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(400).json({ message: "Failed to add to cart" });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { productId, quantity } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }
    
    // If quantity is 0, remove the item
    if (quantity === 0) {
      await storage.removeFromCart(userId, productId);
    } else {
      // Validate product exists and has sufficient stock
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      
      await storage.updateCartItem(userId, productId, quantity);
    }
    
    // Return updated cart
    const { items, total } = await storage.getCartByUserId(userId);
    res.json({ items, total });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(400).json({ message: "Failed to update cart item" });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const productId = parseInt(req.params.productId);
    await storage.removeFromCart(userId, productId);
    
    // Return updated cart
    const { items, total } = await storage.getCartByUserId(userId);
    res.json({ items, total });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    await storage.clearCart(userId);
    res.json({ message: "Cart cleared successfully", items: [], total: 0 });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};

export const applyPromoCode = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false,
        message: "Promo code is required" 
      });
    }
    
    // Get promo code
    const promo = await storage.getPromoByCode(code);
    if (!promo) {
      return res.status(404).json({ 
        success: false,
        message: "Invalid promo code" 
      });
    }
    
    // Validate promo code is active
    if (!promo.isActive) {
      return res.status(400).json({ 
        success: false,
        message: "This promo code is inactive" 
      });
    }
    
    // Validate promo code is within date range
    const now = new Date();
    if (now < new Date(promo.validFrom) || now > new Date(promo.validTo)) {
      return res.status(400).json({ 
        success: false,
        message: "This promo code has expired or is not yet valid" 
      });
    }
    
    // Get cart to calculate discount
    const { items, total } = await storage.getCartByUserId(userId);
    
    // Validate minimum order value
    if (total < promo.minOrderValue) {
      return res.status(400).json({ 
        success: false,
        message: `Minimum order value of ₹${promo.minOrderValue} required for this promo code` 
      });
    }
    
    // Calculate discount
    let discount = 0;
    if (promo.discountType === "percentage") {
      discount = (total * promo.discountValue) / 100;
      
      // Apply max discount if set
      if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
        discount = promo.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discount = promo.discountValue;
    }
    
    res.json({ 
      success: true,
      message: "Promo code applied successfully", 
      discount,
      code: promo.code,
      total: total - discount
    });
  } catch (error) {
    console.error("Apply promo code error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to apply promo code" 
    });
  }
};

// Promo Controllers
export const getPromos = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const promos = await storage.getPromos();
    res.json(promos);
  } catch (error) {
    console.error("Get promos error:", error);
    res.status(500).json({ message: "Failed to get promos" });
  }
};

export const createPromo = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const promoData = insertPromoSchema.parse(req.body);
    
    // Check if promo code already exists
    const existingPromo = await storage.getPromoByCode(promoData.code);
    if (existingPromo) {
      return res.status(400).json({ message: "Promo code already exists" });
    }
    
    const promo = await storage.createPromo(promoData);
    res.status(201).json(promo);
  } catch (error) {
    console.error("Create promo error:", error);
    res.status(400).json({ message: "Failed to create promo" });
  }
};

export const updatePromo = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const promoData = insertPromoSchema.partial().parse(req.body);
    
    // If code is changed, check if it already exists
    if (promoData.code) {
      const existingPromo = await storage.getPromoByCode(promoData.code);
      if (existingPromo && existingPromo.id !== id) {
        return res.status(400).json({ message: "Promo code already exists" });
      }
    }
    
    const updatedPromo = await storage.updatePromo(id, promoData);
    if (!updatedPromo) {
      return res.status(404).json({ message: "Promo not found" });
    }
    
    res.json(updatedPromo);
  } catch (error) {
    console.error("Update promo error:", error);
    res.status(400).json({ message: "Failed to update promo" });
  }
};

export const deletePromo = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const id = parseInt(req.params.id);
    const success = await storage.deletePromo(id);
    
    if (!success) {
      return res.status(404).json({ message: "Promo not found" });
    }
    
    res.json({ message: "Promo deleted successfully" });
  } catch (error) {
    console.error("Delete promo error:", error);
    res.status(500).json({ message: "Failed to delete promo" });
  }
};
