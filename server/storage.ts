import {
  users, categories, products, orders, orderItems, promoCodes, otpVerifications,
  type User, type Category, type Product, type Order, type OrderItem, type PromoCode, type OtpVerification,
  type InsertUser, type InsertCategory, type InsertProduct, type InsertOrder, type InsertOrderItem, type InsertPromoCode, type InsertOtpVerification
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Order methods
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined>;

  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Promo code methods
  getPromoCodes(): Promise<PromoCode[]>;
  getPromoCode(code: string): Promise<PromoCode | undefined>;
  createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode>;
  updatePromoCode(id: number, promoCode: Partial<InsertPromoCode>): Promise<PromoCode | undefined>;
  deletePromoCode(id: number): Promise<boolean>;

  // OTP verification methods
  createOtpVerification(otpVerification: InsertOtpVerification): Promise<OtpVerification>;
  getOtpVerification(phone: string): Promise<OtpVerification | undefined>;
  verifyOtp(phone: string, otp: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private promoCodes: Map<number, PromoCode>;
  private otpVerifications: Map<number, OtpVerification>;

  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentPromoCodeId: number;
  private currentOtpVerificationId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.promoCodes = new Map();
    this.otpVerifications = new Map();

    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentPromoCodeId = 1;
    this.currentOtpVerificationId = 1;

    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create an admin user for admin dashboard access
    this.createUser({
      name: "Admin User",
      email: "admin@quickgrocer.com",
      phone: "9876543210",
      address: "123 Admin Street",
      role: "admin",
      isActive: true
    });

    // Create a delivery partner
    this.createUser({
      name: "Delivery Partner",
      email: "delivery@quickgrocer.com",
      phone: "9876543211",
      address: "456 Delivery Road",
      role: "delivery",
      isActive: true
    });

    // Create a regular customer
    this.createUser({
      name: "Customer User",
      email: "customer@example.com",
      phone: "9876543212",
      address: "789 Customer Avenue",
      role: "customer",
      isActive: true
    });

    // Create categories
    const categories = [
      { name: "Fruits", icon: "ri-shopping-basket-2-line", color: "primary" },
      { name: "Vegetables", icon: "ri-plant-line", color: "green" },
      { name: "Dairy", icon: "ri-cup-line", color: "blue" },
      { name: "Meat", icon: "ri-restaurant-line", color: "red" },
      { name: "Bakery", icon: "ri-bread-line", color: "yellow" },
      { name: "Pantry", icon: "ri-store-2-line", color: "purple" },
      { name: "Frozen", icon: "ri-ice-cream-line", color: "pink" },
      { name: "Household", icon: "ri-medicine-bottle-line", color: "indigo" }
    ];

    categories.forEach(category => {
      this.createCategory({
        name: category.name,
        icon: category.icon,
        color: category.color,
        isActive: true
      });
    });

    // Create products
    const products = [
      {
        name: "Fresh Strawberries",
        description: "Sweet and juicy strawberries",
        price: 199,
        discountPrice: 149,
        unit: "250g pack",
        image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 1,
        stock: 25
      },
      {
        name: "Organic Avocados",
        description: "Creamy and nutritious avocados",
        price: 185,
        discountPrice: 129,
        unit: "Pack of 2",
        image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 1,
        stock: 18
      },
      {
        name: "Farm Fresh Eggs",
        description: "Free-range chicken eggs",
        price: 110,
        discountPrice: 89,
        unit: "12 pcs",
        image: "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 3,
        stock: 30
      },
      {
        name: "Greek Yogurt",
        description: "Creamy, protein-rich yogurt",
        price: 115,
        discountPrice: 75,
        unit: "400g",
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 3,
        stock: 45
      },
      {
        name: "Fresh Milk",
        description: "Pasteurized whole milk",
        price: 60,
        discountPrice: null,
        unit: "1 liter",
        image: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 3,
        stock: 50
      },
      {
        name: "Multigrain Bread",
        description: "Healthy multigrain bread",
        price: 45,
        discountPrice: null,
        unit: "400g loaf",
        image: "https://images.unsplash.com/photo-1584478828637-4cf5380d2c61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 5,
        stock: 35
      },
      {
        name: "Organic Bananas",
        description: "Ripe organic bananas",
        price: 50,
        discountPrice: null,
        unit: "6 pcs",
        image: "https://images.unsplash.com/photo-1596591868231-84731e578099?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 1,
        stock: 40
      },
      {
        name: "Fresh Tomatoes",
        description: "Juicy red tomatoes",
        price: 35,
        discountPrice: null,
        unit: "500g",
        image: "https://images.unsplash.com/photo-1564149504298-00f40315e4c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 2,
        stock: 28
      },
      {
        name: "Chicken Breast",
        description: "Premium boneless chicken",
        price: 180,
        discountPrice: null,
        unit: "500g, Boneless",
        image: "https://images.unsplash.com/photo-1624813743954-d32895a13099?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        categoryId: 4,
        stock: 15
      }
    ];

    products.forEach(product => {
      this.createProduct({
        name: product.name,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        unit: product.unit,
        image: product.image,
        categoryId: product.categoryId,
        stock: product.stock,
        isActive: true
      });
    });

    // Create promo codes
    this.createPromoCode({
      code: "FIRST10",
      discount: 10,
      maxDiscount: 100,
      minOrder: 200,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id, isActive: true, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;

    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      deliveryPartnerId: null,
      estimatedDeliveryTime: null
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder = { ...existingOrder, ...order };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Promo code methods
  async getPromoCodes(): Promise<PromoCode[]> {
    return Array.from(this.promoCodes.values());
  }

  async getPromoCode(code: string): Promise<PromoCode | undefined> {
    return Array.from(this.promoCodes.values()).find(promoCode => 
      promoCode.code === code && 
      promoCode.isActive && 
      (!promoCode.expiresAt || promoCode.expiresAt > new Date())
    );
  }

  async createPromoCode(promoCode: InsertPromoCode): Promise<PromoCode> {
    const id = this.currentPromoCodeId++;
    const newPromoCode: PromoCode = { ...promoCode, id };
    this.promoCodes.set(id, newPromoCode);
    return newPromoCode;
  }

  async updatePromoCode(id: number, promoCode: Partial<InsertPromoCode>): Promise<PromoCode | undefined> {
    const existingPromoCode = this.promoCodes.get(id);
    if (!existingPromoCode) return undefined;

    const updatedPromoCode = { ...existingPromoCode, ...promoCode };
    this.promoCodes.set(id, updatedPromoCode);
    return updatedPromoCode;
  }

  async deletePromoCode(id: number): Promise<boolean> {
    return this.promoCodes.delete(id);
  }

  // OTP verification methods
  async createOtpVerification(otpVerification: InsertOtpVerification): Promise<OtpVerification> {
    const id = this.currentOtpVerificationId++;
    const newOtpVerification: OtpVerification = { 
      ...otpVerification, 
      id, 
      verified: false, 
      createdAt: new Date() 
    };
    this.otpVerifications.set(id, newOtpVerification);
    return newOtpVerification;
  }

  async getOtpVerification(phone: string): Promise<OtpVerification | undefined> {
    return Array.from(this.otpVerifications.values())
      .filter(otp => otp.phone === phone)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const verification = await this.getOtpVerification(phone);
    if (!verification) return false;
    
    if (verification.otp === otp && verification.expiresAt > new Date()) {
      verification.verified = true;
      this.otpVerifications.set(verification.id, verification);
      return true;
    }
    
    return false;
  }
}

export const storage = new MemStorage();
