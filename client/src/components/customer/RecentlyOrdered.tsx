import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@shared/schema";
import { API_ENDPOINTS, APP_CURRENCY } from "@shared/constants";
import { apiRequest } from "@/lib/queryClient";

export default function RecentlyOrdered() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  // Only fetch if user is authenticated
  const { data: recentItems, isLoading, error } = useQuery<{
    orderId: string;
    date: string;
    status: string;
    items: Product[];
  }>({
    queryKey: [API_ENDPOINTS.ORDERS + "/recent"],
    enabled: isAuthenticated,
  });

  // Mutation for adding to cart
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!isAuthenticated) {
        // Find the product in recent items and add to cart locally
        const product = recentItems?.items.find(item => item.id === productId);
        if (product) {
          addToCart(product, 1);
        }
        return { success: true };
      }
      
      // Otherwise send to the server
      const res = await apiRequest("POST", API_ENDPOINTS.ADD_TO_CART, {
        productId,
        quantity: 1
      });
      return await res.json();
    },
    onSuccess: (data, productId) => {
      if (data.success) {
        const product = recentItems?.items.find(item => item.id === productId);
        toast({
          title: "Added to Cart",
          description: `${product?.name || 'Product'} has been added to your cart.`,
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Function to handle adding a recently ordered item back to cart
  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate(productId);
  };

  // Function to handle reordering all items from the recent order
  const handleReorderAll = () => {
    if (!recentItems?.items.length) return;
    
    // Add all items to cart one by one
    recentItems.items.forEach(item => {
      addToCartMutation.mutate(item.id);
    });
  };

  if (!isAuthenticated) {
    return null; // Don't show this component if user is not logged in
  }

  if (isLoading) {
    return (
      <div className="my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-poppins font-semibold text-lg">Recently Ordered</h2>
          <Button variant="ghost" size="sm" disabled>Reorder All</Button>
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !recentItems) {
    return null; // Don't show on error
  }

  // If no recent orders, don't show the component
  if (!recentItems.items.length) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-poppins font-semibold text-lg">Recently Ordered</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-600 dark:text-primary-400 text-sm font-medium"
          onClick={handleReorderAll}
        >
          Reorder All
        </Button>
      </div>
      
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm border border-neutral-200 dark:border-dark-border p-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-dark-border">
          <div className="flex items-center">
            <span className="material-icons text-primary-600 dark:text-primary-400 mr-2">
              history
            </span>
            <div>
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Order #{recentItems.orderId}</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{recentItems.date}</p>
            </div>
          </div>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
            {recentItems.status}
          </span>
        </div>

        <div className="flex mt-3 space-x-3 overflow-x-auto hide-scrollbar pb-2">
          {recentItems.items.map((item) => (
            <div key={item.id} className="flex flex-col items-center space-y-1 min-w-[4.5rem]">
              <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 p-1 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-icons text-neutral-400">image</span>
                )}
              </div>
              <span className="text-xs text-center text-neutral-800 dark:text-neutral-300 whitespace-nowrap">
                {item.name}
              </span>
              <button 
                className="text-xs text-primary-600 dark:text-primary-400"
                onClick={() => handleAddToCart(item.id)}
                disabled={addToCartMutation.isPending}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
