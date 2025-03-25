import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { OrderWithItems } from "@shared/types";
import { API_ENDPOINTS, ORDER_STATUSES, APP_CURRENCY } from "@shared/constants";

export default function Orders() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch user orders
  const { data: orders, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: [API_ENDPOINTS.ORDERS],
    enabled: isAuthenticated,
  });

  // Filter orders based on active tab
  const filteredOrders = orders?.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "active") {
      return ["pending", "packed", "shipped"].includes(order.status);
    }
    if (activeTab === "completed") {
      return order.status === "delivered";
    }
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto px-4 pb-16 flex flex-col items-center justify-center flex-1">
          <div className="text-center p-6 max-w-md mx-auto">
            <span className="material-icons text-neutral-400 text-6xl mb-4">account_circle</span>
            <h2 className="text-xl font-semibold mb-2">Login to View Orders</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              Please login to view your order history and track your deliveries.
            </p>
            <Link href="/login">
              <a>
                <Button>Login</Button>
              </a>
            </Link>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 pb-16">
        <div className="my-4">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">My Orders</h1>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-center">
                  Failed to load orders. Please try again.
                </div>
              ) : !filteredOrders?.length ? (
                <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
                  <span className="material-icons text-neutral-400 text-5xl mb-2">receipt_long</span>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    You don't have any {activeTab !== "all" ? activeTab : ""} orders yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => {
                    const orderStatus = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES];
                    const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    });
                    
                    return (
                      <Link key={order.id} href={`/orders/${order.id}`}>
                        <a className="block bg-white dark:bg-dark-surface rounded-lg overflow-hidden shadow-sm border border-neutral-200 dark:border-dark-border">
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div>
                                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                                  Order #{order.orderNumber}
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{orderDate}</p>
                              </div>
                              <Badge variant={orderStatus?.color as any || "neutral"}>
                                {orderStatus?.label || order.status}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                                </p>
                                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                  {APP_CURRENCY}{(order.total / 100).toFixed(2)}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">View Details</Button>
                            </div>
                          </div>
                          
                          {/* Preview of items */}
                          <div className="bg-neutral-50 dark:bg-neutral-800 px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
                            {order.items.slice(0, 3).map(item => (
                              <div key={item.id} className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-neutral-700 p-1 flex items-center justify-center overflow-hidden">
                                  {item.product.image ? (
                                    <img 
                                      src={item.product.image} 
                                      alt={item.product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="material-icons text-neutral-400 text-sm">inventory_2</span>
                                  )}
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex-shrink-0 flex items-center">
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                  +{order.items.length - 3} more
                                </span>
                              </div>
                            )}
                          </div>
                        </a>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
