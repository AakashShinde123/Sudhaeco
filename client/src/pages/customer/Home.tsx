import { useState } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { CategorySlider } from "@/components/customer/CategorySlider";
import { OffersBanner } from "@/components/customer/OffersBanner";
import { ProductGrid } from "@/components/customer/ProductGrid";
import { Clock } from "lucide-react";

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const handleCategorySelect = (categoryId: number) => {
    // If the same category is selected again, deselect it
    if (categoryId === selectedCategoryId) {
      setSelectedCategoryId(undefined);
    } else {
      setSelectedCategoryId(categoryId);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Delivery Promise Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-6 w-6 mr-2" />
            <div>
              <p className="font-bold text-lg">10-Minute Delivery</p>
              <p className="text-xs text-primary-100">Order now for lightning-fast delivery</p>
            </div>
          </div>
          <div className="bg-white text-primary font-bold py-1 px-3 rounded-full text-sm animate-pulse">
            LIVE
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Categories */}
        <CategorySlider 
          onSelectCategory={handleCategorySelect} 
          selectedCategoryId={selectedCategoryId}
        />

        {/* Offers Banner */}
        <OffersBanner />

        {/* Flash Deals */}
        <ProductGrid 
          title="Flash Deals" 
          isFlashDeal={true} 
          categoryId={selectedCategoryId} 
          limit={5} 
        />

        {/* Popular Products */}
        <ProductGrid 
          title="Popular Products" 
          categoryId={selectedCategoryId} 
          limit={10} 
        />
      </main>

      <Footer />
    </div>
  );
}
