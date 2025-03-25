import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  ChevronLeft, 
  Minus, 
  Plus, 
  Clock, 
  Heart, 
  Share2 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/utils/format";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`]
  });

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity
      });
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart`,
      });
    }
  };

  const handleWishlist = () => {
    toast({
      title: "Added to wishlist",
      description: "This item has been added to your wishlist",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || "Turbo Groceries product",
        text: `Check out this product: ${product?.name}`,
        url: window.location.href,
      }).catch((error) => {
        console.log('Error sharing', error);
      });
    } else {
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard.",
      });
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to products
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="w-full aspect-square rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-6 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Product</h2>
          <p className="mb-6">We couldn't find the product you're looking for.</p>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.discountPrice 
    ? Math.round((1 - product.discountPrice / product.price) * 100) 
    : 0;

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to products
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <div className="relative rounded-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full object-cover aspect-square"
              />
              
              {product.discountPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                  -{discountPercentage}%
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full bg-white/80 text-gray-800 hover:bg-white"
                  onClick={handleWishlist}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full bg-white/80 text-gray-800 hover:bg-white"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300 text-xs font-medium px-2 py-1 rounded flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                10 min delivery
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{product.unit}</p>
            
            {product.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {product.description}
              </p>
            )}
            
            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center">
                <span className="text-2xl font-bold">
                  {formatCurrency(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
              
              {product.discountPrice && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                  You save {formatCurrency(product.price - product.discountPrice)} ({discountPercentage}%)
                </p>
              )}
            </div>
            
            {/* Quantity Selector */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Quantity</span>
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-gray-500"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-gray-500"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Total and Add to Cart Button */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Price</span>
                <p className="text-xl font-bold">
                  {formatCurrency((product.discountPrice || product.price) * quantity)}
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white font-bold"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>
            
            {/* Stock Info */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.stock > 10 
                ? "In Stock" 
                : product.stock > 0 
                  ? `Only ${product.stock} left in stock!` 
                  : "Out of Stock"}
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
