import { Request, Response } from "express";
import { storage } from "../storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { broadcastOrderUpdate } from "../services/websocket.service";

// Order Controllers
export const getOrders = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Parse query parameters
    const status = req.query.status as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    
    const { orders, total } = await storage.getOrders({ status, limit, page });
    res.json({ orders, total });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to get orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user has permission to view this order
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    if (!userId || (userRole !== "admin" && order.userId !== userId && userRole !== "delivery")) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to get order" });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Check if user has permission to view these orders
    const sessionUserId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    if (!sessionUserId || (userRole !== "admin" && userId !== sessionUserId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const orders = await storage.getUserOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Failed to get user orders" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Validate request body
    const orderData = insertOrderSchema.parse({
      ...req.body,
      userId
    });
    
    // Validate order items
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Order must contain at least one item" 
      });
    }
    
    // Check if all products exist and have sufficient stock
    for (const item of req.body.items) {
      const product = await storage.getProductById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `Product with ID ${item.productId} not found` 
        });
      }
      
      if (!product.isActive) {
        return res.status(400).json({ 
          success: false,
          message: `Product ${product.name} is currently unavailable` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false,
          message: `Insufficient stock for ${product.name}` 
        });
      }
    }
    
    // Create order
    const order = await storage.createOrder(orderData, req.body.items);
    
    // Clear the cart after successful order
    await storage.clearCart(userId);
    
    // Broadcast order update
    broadcastOrderUpdate({
      orderId: order.id,
      status: order.status,
      eta: order.eta,
      userId: order.userId
    });
    
    res.status(201).json({ 
      success: true,
      message: "Order created successfully", 
      orderId: order.id 
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(400).json({ 
      success: false,
      message: "Failed to create order" 
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    // Check if user has permission to update orders
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin" && userRole !== "delivery") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    // Validate status
    if (!["pending", "packed", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    // For delivery partners, only allow updating to "delivered" status
    if (userRole === "delivery" && status !== "delivered") {
      return res.status(403).json({ message: "Delivery partners can only mark orders as delivered" });
    }
    
    const updatedOrder = await storage.updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Broadcast order update
    broadcastOrderUpdate({
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      eta: updatedOrder.eta,
      userId: updatedOrder.userId
    });
    
    res.json({ 
      success: true,
      message: "Order status updated successfully", 
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

export const assignDeliveryPartner = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const orderId = parseInt(req.params.id);
    const { deliveryPartnerId } = req.body;
    
    if (!deliveryPartnerId) {
      return res.status(400).json({ message: "Delivery partner ID is required" });
    }
    
    // Validate delivery partner exists
    const deliveryPartner = await storage.getDeliveryPartnerById(deliveryPartnerId);
    if (!deliveryPartner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    
    const updatedOrder = await storage.assignDeliveryPartner(orderId, deliveryPartnerId);
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Broadcast order update
    broadcastOrderUpdate({
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      eta: updatedOrder.eta,
      userId: updatedOrder.userId,
      deliveryPartnerId
    });
    
    res.json({ 
      success: true,
      message: "Delivery partner assigned successfully", 
      order: updatedOrder 
    });
  } catch (error) {
    console.error("Assign delivery partner error:", error);
    res.status(500).json({ message: "Failed to assign delivery partner" });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    
    // Get the order
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if user has permission to cancel this order
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    if (!userId || (userRole !== "admin" && order.userId !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Only allow cancellation if order is pending or packed
    if (order.status !== "pending" && order.status !== "packed") {
      return res.status(400).json({ 
        message: "Cannot cancel order that is already shipped or delivered" 
      });
    }
    
    const cancelledOrder = await storage.cancelOrder(orderId);
    
    // Broadcast order update
    broadcastOrderUpdate({
      orderId: cancelledOrder!.id,
      status: "cancelled",
      userId: cancelledOrder!.userId
    });
    
    res.json({ 
      success: true,
      message: "Order cancelled successfully", 
      order: cancelledOrder 
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const dashboardData = await storage.getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error("Get dashboard data error:", error);
    res.status(500).json({ message: "Failed to get dashboard data" });
  }
};
