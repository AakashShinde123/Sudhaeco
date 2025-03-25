import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertCategorySchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema, insertPromoCodeSchema } from "@shared/schema";
import { z } from "zod";

// Type for connected clients with their user info
type Client = {
  ws: WebSocket;
  userId?: number;
  role?: string;
};

// Helper function to generate OTP - 6-digit OTP as per OTP_LENGTH in constants
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mock implementation of Fast2SMS API for sending OTP
async function sendOTP(phone: string, otp: string): Promise<boolean> {
  console.log(`Sending OTP ${otp} to ${phone}`);
  return true; // In a real implementation, this would call the Fast2SMS API
}

// Helper to broadcast to specific role or user
function broadcast(clients: Map<string, Client>, message: any, filter?: { role?: string, userId?: number }) {
  const data = JSON.stringify(message);
  
  clients.forEach((client) => {
    // Skip clients that don't match filter criteria
    if (filter?.role && client.role !== filter.role) return;
    if (filter?.userId && client.userId !== filter.userId) return;
    
    // Only send to open connections
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, Client>();

  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(2, 15);
    const client: Client = { ws };
    clients.set(id, client);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Associate connection with user if authentication info is provided
        if (data.type === 'auth' && data.userId) {
          const user = await storage.getUser(data.userId);
          if (user) {
            client.userId = user.id;
            client.role = user.role;
            console.log(`User ${user.id} (${user.role}) connected`);
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(id);
    });
  });

  // Auth routes
  app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        phone: z.string().min(10).max(15)
      });
      
      const { phone } = schema.parse(req.body);
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
      
      // Save OTP to storage
      await storage.createOtpVerification({
        phone,
        otp,
        expiresAt
      });
      
      // Send OTP via Fast2SMS
      const sent = await sendOTP(phone, otp);
      
      if (sent) {
        res.json({ success: true, message: 'OTP sent successfully' });
      } else {
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid phone number' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        phone: z.string().min(10).max(15),
        otp: z.string().length(6)
      });
      
      const { phone, otp } = schema.parse(req.body);
      
      // Verify OTP
      const verified = await storage.verifyOtp(phone, otp);
      
      if (verified) {
        // Check if user exists
        let user = await storage.getUserByPhone(phone);
        
        // Create user if doesn't exist
        if (!user) {
          user = await storage.createUser({
            phone,
            role: 'customer',
            name: null,
            email: null,
            address: null
          });
        }
        
        res.json({ 
          success: true, 
          message: 'OTP verified successfully',
          user
        });
      } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid phone number or OTP' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  // User routes
  app.put('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const schema = insertUserSchema.partial();
      const data = schema.parse(req.body);
      
      const updatedUser = await storage.updateUser(id, data);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid user data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  // Category routes
  app.get('/api/categories', async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/categories', async (req: Request, res: Response) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid category data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.put('/api/categories/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, data);
      
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid category data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.delete('/api/categories/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Product routes
  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let products;
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid product data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, data);
      
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid product data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Order routes
  app.get('/api/orders', async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      let orders;
      if (userId) {
        orders = await storage.getOrdersByUser(userId);
      } else {
        orders = await storage.getOrders();
      }
      
      // For each order, get order items
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        return { ...order, items };
      }));
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.get('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      const items = await storage.getOrderItems(order.id);
      
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    try {
      const orderSchema = insertOrderSchema.extend({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().positive(),
          price: z.number().positive()
        }))
      });
      
      const { items, ...orderData } = orderSchema.parse(req.body);
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const orderItems = await Promise.all(items.map(item => 
        storage.createOrderItem({
          orderId: order.id,
          ...item
        })
      ));
      
      // Update product stock
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.updateProduct(product.id, {
            stock: product.stock - item.quantity
          });
        }
      }
      
      // Notify about new order
      broadcast(clients, {
        type: 'newOrder',
        orderId: order.id
      }, { role: 'admin' });
      
      // Set delivery partner and estimated time (would be assigned automatically in real app)
      const estimatedDeliveryTime = 10; // 10 minutes
      const updatedOrder = await storage.updateOrder(order.id, {
        estimatedDeliveryTime,
        status: 'preparing'
      });
      
      res.status(201).json({ ...updatedOrder, items: orderItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid order data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.put('/api/orders/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      const schema = z.object({
        status: z.enum(['pending', 'preparing', 'packed', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
        paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
        deliveryPartnerId: z.number().nullable().optional(),
        estimatedDeliveryTime: z.number().nullable().optional()
      });
      
      const data = schema.parse(req.body);
      const updatedOrder = await storage.updateOrder(id, data);
      
      // Notify user about order status change
      if (data.status && updatedOrder) {
        broadcast(clients, {
          type: 'orderStatusUpdate',
          orderId: id,
          status: data.status
        }, { userId: updatedOrder.userId });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid order data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  // Promo code routes
  app.get('/api/promo-codes', async (_req: Request, res: Response) => {
    try {
      const promoCodes = await storage.getPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  app.post('/api/promo-codes/validate', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        code: z.string(),
        total: z.number().optional()
      });
      
      const { code, total } = schema.parse(req.body);
      const promoCode = await storage.getPromoCode(code);
      
      if (!promoCode) {
        return res.status(404).json({ success: false, message: 'Invalid promo code' });
      }
      
      if (promoCode.minOrder && total && total < promoCode.minOrder) {
        return res.status(400).json({ 
          success: false, 
          message: `Minimum order amount is ₹${promoCode.minOrder}` 
        });
      }
      
      // Calculate discount
      let discount = 0;
      if (total) {
        discount = total * (promoCode.discount / 100);
        if (promoCode.maxDiscount && discount > promoCode.maxDiscount) {
          discount = promoCode.maxDiscount;
        }
      }
      
      res.json({
        success: true,
        promoCode: {
          ...promoCode,
          calculatedDiscount: discount
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid promo code data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.post('/api/promo-codes', async (req: Request, res: Response) => {
    try {
      const data = insertPromoCodeSchema.parse(req.body);
      const promoCode = await storage.createPromoCode(data);
      res.status(201).json(promoCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid promo code data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.put('/api/promo-codes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertPromoCodeSchema.partial().parse(req.body);
      const promoCode = await storage.updatePromoCode(id, data);
      
      if (!promoCode) {
        return res.status(404).json({ success: false, message: 'Promo code not found' });
      }
      
      res.json(promoCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid promo code data' });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  });

  app.delete('/api/promo-codes/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePromoCode(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Promo code not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  // Simulated payment gateway (in a real app, you would integrate with a real payment gateway)
  app.post('/api/payments/process', async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        orderId: z.number(),
        paymentMethod: z.enum(['upi', 'card', 'cod', 'wallet']),
        amount: z.number()
      });
      
      const { orderId, paymentMethod, amount } = schema.parse(req.body);
      
      // In a real app, you would call the payment gateway API here
      const paymentStatus = paymentMethod === 'cod' ? 'pending' : 'paid';
      
      // Update order payment status
      await storage.updateOrder(orderId, { paymentStatus });
      
      res.json({
        success: true,
        paymentStatus,
        message: `Payment ${paymentStatus === 'paid' ? 'completed' : 'pending'} successfully`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Invalid payment data' });
      } else {
        res.status(500).json({ success: false, message: 'Payment processing failed' });
      }
    }
  });

  return httpServer;
}
