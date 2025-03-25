import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import Home from "@/pages/customer/Home";
import ProductDetails from "@/pages/customer/ProductDetails";
import Checkout from "@/pages/customer/Checkout";
import OrderTracking from "@/pages/customer/OrderTracking";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminOrders from "@/pages/admin/Orders";
import AdminProducts from "@/pages/admin/Products";
import AdminCategories from "@/pages/admin/Categories";
import AdminDelivery from "@/pages/admin/Delivery";
import DeliveryDashboard from "@/pages/delivery/DeliveryDashboard";

function Router() {
  const [location] = useLocation();
  
  // Check if current route is part of admin or delivery dashboard
  const isAdminRoute = location.startsWith("/admin");
  const isDeliveryRoute = location.startsWith("/delivery");

  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/auth" component={Auth} />
      
      {/* Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order/:id" component={OrderTracking} />
      
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/delivery" component={AdminDelivery} />
      
      {/* Delivery Partner Routes */}
      <Route path="/delivery" component={DeliveryDashboard} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
