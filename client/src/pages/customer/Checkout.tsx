import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  CreditCard, 
  Landmark, 
  Wallet, 
  Truck, 
  MapPin,
  Phone,
  User
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/format";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

type PaymentMethod = "upi" | "card" | "cod" | "wallet";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  
  const [address, setAddress] = useState(user?.address || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  
  // Calculate order summary
  const subtotal = total;
  const deliveryFee = 30;
  const taxes = Math.round(subtotal * 0.05); // 5% tax
  const discount = appliedPromo ? appliedPromo.calculatedDiscount : 0;
  const grandTotal = subtotal + deliveryFee + taxes - discount;
  
  // Promo code validation mutation
  const promoMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/promo-codes/validate", {
        code,
        total: subtotal
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAppliedPromo(data.promoCode);
        toast({
          title: "Promo code applied!",
          description: `You saved ${formatCurrency(data.promoCode.calculatedDiscount)}`
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Invalid promo code",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Order placement mutation
  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // 1. Create order
      const orderResponse = await apiRequest("POST", "/api/orders", {
        userId: user.id,
        total: grandTotal,
        address,
        paymentMethod,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: (item.discountPrice || item.price)
        }))
      });
      const order = await orderResponse.json();
      
      // 2. Process payment
      const paymentResponse = await apiRequest("POST", "/api/payments/process", {
        orderId: order.id,
        paymentMethod,
        amount: grandTotal
      });
      
      return { order, payment: await paymentResponse.json() };
    },
    onSuccess: (data) => {
      // Clear cart and navigate to order tracking
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Order placed successfully!",
        description: "Your order has been placed and will be delivered in 10 minutes."
      });
      
      navigate(`/order/${data.order.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Please enter a promo code",
        variant: "destructive"
      });
      return;
    }
    
    promoMutation.mutate(promoCode);
  };
  
  const handlePlaceOrder = () => {
    // Validate inputs
    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please provide a delivery address",
        variant: "destructive"
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide your name",
        variant: "destructive"
      });
      return;
    }
    
    if (!phone.trim()) {
      toast({
        title: "Phone required",
        description: "Please provide your phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return;
    }
    
    // Place order
    orderMutation.mutate();
  };
  
  // If cart is empty, redirect to home
  if (items.length === 0 && !orderMutation.isPending) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="mb-6">Add some items to your cart before checking out</p>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Delivery & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex">
                    <User className="mr-2 h-5 w-5 text-gray-400 self-center" />
                    <Input 
                      id="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex">
                    <Phone className="mr-2 h-5 w-5 text-gray-400 self-center" />
                    <Input 
                      id="phone"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <div className="flex">
                    <MapPin className="mr-2 h-5 w-5 text-gray-400 self-start mt-2" />
                    <Textarea 
                      id="address"
                      placeholder="Enter your full address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center cursor-pointer flex-1">
                      <div className="w-8 h-8 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">UPI</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Google Pay, PhonePe, Paytm etc.</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                      <div className="w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Credit / Debit Card</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">All major cards accepted</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center cursor-pointer flex-1">
                      <div className="w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center mr-3">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Mobile Wallet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amazon Pay, Freecharge etc.</p>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center cursor-pointer flex-1">
                      <div className="w-8 h-8 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mr-3">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pay when you receive</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Promo Code */}
                <div className="flex space-x-2 pt-4">
                  <Input 
                    placeholder="Enter promo code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={!!appliedPromo || promoMutation.isPending}
                  />
                  <Button 
                    onClick={handleApplyPromo}
                    disabled={!promoCode || !!appliedPromo || promoMutation.isPending}
                  >
                    Apply
                  </Button>
                </div>
                
                {appliedPromo && (
                  <div className="text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-md flex justify-between">
                    <span>Promo: {appliedPromo.code}</span>
                    <span>-{formatCurrency(appliedPromo.calculatedDiscount)}</span>
                  </div>
                )}
                
                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                    <span>{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>
                
                {/* Total */}
                <div className="border-t pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                
                {/* Place Order Button */}
                <Button 
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold mt-4"
                  onClick={handlePlaceOrder}
                  disabled={orderMutation.isPending}
                >
                  {orderMutation.isPending ? "Processing..." : "Place Order"}
                </Button>
                
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  <Truck className="h-3 w-3 mr-1" />
                  Delivery in 10 minutes or less!
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
