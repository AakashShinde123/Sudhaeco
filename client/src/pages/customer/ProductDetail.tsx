import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/customer/Header";
import { BottomNavigation } from "@/components/customer/BottomNavigation";
import { CartModal } from "@/components/customer/Cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Minus, Plus, Heart } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', id],
    enabled: !!id
  });
  
  // Format price from paise to rupees with ₹ symbol
  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(2)}`;
  };
  
  // Handle quantity changes
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = async () => {
    if (product) {
      await addToCart({
        productId: product.id,
        quantity: quantity
      });
      setIsCartOpen(true);
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        
        <div className="container px-4 py-6">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <Skeleton className="h-64 w-full rounded-lg mb-4" />
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            
            <div className="flex justify-between items-center mt-6">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        </div>
        
        <BottomNavigation onCartOpen={() => setIsCartOpen(true)} />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="bg-white min-h-screen">
        <Header onCartOpen={() => setIsCartOpen(true)} />
        
        <div className="container px-4 py-6 text-center">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="py-16">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-500 mb-4">Failed to load product details</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        </div>
        
        <BottomNavigation onCartOpen={() => setIsCartOpen(true)} />
      </div>
    );
  }
  
  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  const currentPrice = product.salePrice || product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;
  
  return (
    <div className="bg-white min-h-screen">
      <Header onCartOpen={() => setIsCartOpen(true)} />
      
      <div className="container px-4 py-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/")}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div className="relative mb-6">
          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-error text-white text-xs px-2 py-0.5 rounded">
              {discountPercentage}% OFF
            </span>
          )}
          
          <img 
            src={product.image || `https://via.placeholder.com/600x400?text=${encodeURIComponent(product.name)}`} 
            alt={product.name} 
            className="w-full h-64 object-cover rounded-lg"
          />
          
          <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
            <Heart className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          
          <div className="flex items-center">
            <span className="text-xl font-bold mr-2">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <span className="text-gray-500 line-through">{formatPrice(product.price)}</span>
            )}
            <span className="ml-2 text-gray-500">per {product.unit}</span>
          </div>
          
          {product.description && (
            <div>
              <h2 className="font-semibold mb-1">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
          
          <div className="py-4">
            <h2 className="font-semibold mb-3">Quantity</h2>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="mx-4 font-medium text-lg w-8 text-center">{quantity}</span>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={incrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <div>
              <p className="text-gray-500">Total Price</p>
              <p className="text-xl font-bold">{formatPrice(currentPrice * quantity)}</p>
            </div>
            
            <Button 
              className="px-6 py-6 bg-primary text-white rounded-xl"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
      
      <BottomNavigation onCartOpen={() => setIsCartOpen(true)} />
      
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
