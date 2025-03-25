import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@shared/schema";
import { formatCurrency } from "@/utils/format";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer">
        {/* Product Image */}
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-32 md:h-40 object-cover"
          />
          {product.discountPrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{Math.round((1 - product.discountPrice / product.price) * 100)}%
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-3">
          <div className="flex items-center mb-1">
            <span className="text-xs bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300 px-2 py-0.5 rounded flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              10 min
            </span>
          </div>
          <h3 className="font-medium text-sm mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.unit}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold">{formatCurrency(product.discountPrice || product.price)}</span>
              {product.discountPrice && (
                <span className="text-xs text-gray-500 line-through ml-1">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            <Button 
              size="icon" 
              className="bg-primary hover:bg-primary/90 text-white p-1.5 rounded-full h-8 w-8"
              onClick={handleAddToCart}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
