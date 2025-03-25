import { Request, Response } from "express";
import { storage } from "../storage";
import { broadcastLocationUpdate } from "../services/websocket.service";

export const getDeliveryPartners = async (req: Request, res: Response) => {
  try {
    // Validate admin role
    const userRole = (req.session as any)?.userRole;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const partners = await storage.getDeliveryPartners();
    res.json(partners);
  } catch (error) {
    console.error("Get delivery partners error:", error);
    res.status(500).json({ message: "Failed to get delivery partners" });
  }
};

export const getDeliveryPartnerById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user has permission
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    // Get the delivery partner
    const partner = await storage.getDeliveryPartnerById(id);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    
    // Only allow admin or the delivery partner themselves
    if (!userId || (userRole !== "admin" && partner.userId !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(partner);
  } catch (error) {
    console.error("Get delivery partner error:", error);
    res.status(500).json({ message: "Failed to get delivery partner" });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { lat, lng } = req.body;
    
    // Validate location data
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: "Invalid location data" });
    }
    
    // Check if user has permission
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    // Get the delivery partner
    const partner = await storage.getDeliveryPartnerById(id);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    
    // Only allow admin or the delivery partner themselves
    if (!userId || (userRole !== "admin" && partner.userId !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Update location
    const updatedPartner = await storage.updateLocation(id, { lat, lng });
    
    // Broadcast location update for any active orders
    const activeOrders = await storage.getDeliveryPartnerOrders(id);
    const inProgressOrders = activeOrders.filter(
      order => order.status === "shipped"
    );
    
    if (inProgressOrders.length > 0) {
      inProgressOrders.forEach(order => {
        broadcastLocationUpdate({
          orderId: order.id,
          location: { lat, lng },
          deliveryPartnerId: id,
          userId: order.userId
        });
      });
    }
    
    res.json({ 
      success: true,
      message: "Location updated successfully" 
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Failed to update location" });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { isAvailable } = req.body;
    
    // Validate availability data
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: "Invalid availability data" });
    }
    
    // Check if user has permission
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    // Get the delivery partner
    const partner = await storage.getDeliveryPartnerById(id);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    
    // Only allow admin or the delivery partner themselves
    if (!userId || (userRole !== "admin" && partner.userId !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Check if partner has active orders before going offline
    if (!isAvailable) {
      const activeOrders = await storage.getDeliveryPartnerOrders(id);
      const inProgressOrders = activeOrders.filter(
        order => order.status === "shipped"
      );
      
      if (inProgressOrders.length > 0) {
        return res.status(400).json({ 
          message: "Cannot go offline with active deliveries. Please complete your deliveries first." 
        });
      }
    }
    
    // Update availability
    const updatedPartner = await storage.updateAvailability(id, isAvailable);
    
    res.json({ 
      success: true,
      message: "Availability updated successfully", 
      isAvailable 
    });
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({ message: "Failed to update availability" });
  }
};

export const getDeliveryPartnerOrders = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user has permission
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    // Get the delivery partner
    const partner = await storage.getDeliveryPartnerById(id);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    
    // Only allow admin or the delivery partner themselves
    if (!userId || (userRole !== "admin" && partner.userId !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const orders = await storage.getDeliveryPartnerOrders(id);
    res.json(orders);
  } catch (error) {
    console.error("Get delivery partner orders error:", error);
    res.status(500).json({ message: "Failed to get delivery partner orders" });
  }
};

export const getEarnings = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user has permission
    const userId = (req.session as any)?.userId;
    const userRole = (req.session as any)?.userRole;
    
    // Get the delivery partner
    const partner = await storage.getDeliveryPartnerById(id);
    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    
    // Only allow admin or the delivery partner themselves
    if (!userId || (userRole !== "admin" && partner.userId !== userId)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    // Get all completed orders
    const allOrders = await storage.getDeliveryPartnerOrders(id);
    const completedOrders = allOrders.filter(
      order => order.status === "delivered"
    );
    
    // Calculate earnings (for simplicity, assume fixed percentage of delivery fee)
    const earnings = completedOrders.reduce((total, order) => {
      return total + (order.deliveryFee * 0.8); // 80% of delivery fee goes to delivery partner
    }, 0);
    
    // Group earnings by day
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeekStart = new Date(today);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
    
    const todayEarnings = completedOrders
      .filter(order => new Date(order.updatedAt) >= todayStart)
      .reduce((total, order) => total + (order.deliveryFee * 0.8), 0);
      
    const yesterdayEarnings = completedOrders
      .filter(order => {
        const date = new Date(order.updatedAt);
        return date >= yesterdayStart && date < todayStart;
      })
      .reduce((total, order) => total + (order.deliveryFee * 0.8), 0);
      
    const lastWeekEarnings = completedOrders
      .filter(order => new Date(order.updatedAt) >= lastWeekStart)
      .reduce((total, order) => total + (order.deliveryFee * 0.8), 0);
    
    res.json({
      totalEarnings: earnings,
      todayEarnings,
      yesterdayEarnings,
      lastWeekEarnings,
      deliveriesCompleted: completedOrders.length,
      totalDeliveries: partner.totalDeliveries,
      rating: partner.rating
    });
  } catch (error) {
    console.error("Get earnings error:", error);
    res.status(500).json({ message: "Failed to get earnings" });
  }
};
