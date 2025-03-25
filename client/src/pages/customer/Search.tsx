import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/customer/Header";
import BottomNavigation from "@/components/customer/BottomNavigation";
import ProductCard, { ProductCardSkeleton } from "@/components/customer/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import { API_ENDPOINTS } from "@shared/constants";

export default function Search() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Handle debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Search products query
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: [API_ENDPOINTS.SEARCH_PRODUCTS, debouncedSearchTerm],
    enabled: !!debouncedSearchTerm,
  });

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  // Handle voice search
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setSearchQuery(transcript);
      };
      
      recognition.start();
    } else {
      alert('Voice search is not supported in your browser.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 pb-16">
        <div className="my-4">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-neutral-400 text-lg">search</span>
              </div>
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="ml-2"
              onClick={handleVoiceSearch}
              aria-label="Voice search"
            >
              <span className="material-icons text-neutral-500">mic</span>
            </Button>
          </form>
        </div>

        {/* Search Results */}
        <div className="my-6">
          {searchQuery && (
            <h2 className="font-poppins font-semibold text-lg mb-4">
              Search Results for "{searchQuery}"
            </h2>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-center">
              Failed to load search results. Please try again.
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <span className="material-icons text-neutral-400 text-5xl mb-2">search_off</span>
              <p className="text-neutral-600 dark:text-neutral-400">
                No products found for "{searchQuery}". Try a different search term.
              </p>
            </div>
          ) : (
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center">
              <span className="material-icons text-neutral-400 text-5xl mb-2">search</span>
              <p className="text-neutral-600 dark:text-neutral-400">
                Start typing to search for products
              </p>
            </div>
          )}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
