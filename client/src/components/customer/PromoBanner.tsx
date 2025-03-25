import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface PromoBannerProps {
  title: string;
  description: string;
  code: string;
  backgroundClass?: string;
  imageSrc?: string;
  onAction?: () => void;
}

export function PromoBanner({ 
  title, 
  description, 
  code, 
  backgroundClass = "bg-gradient-to-r from-violet-600 to-primary",
  imageSrc,
  onAction
}: PromoBannerProps) {
  const [, navigate] = useLocation();
  
  const handleClick = () => {
    if (onAction) {
      onAction();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="p-4 hide-scrollbar">
      <div className={`relative rounded-xl overflow-hidden h-36 ${backgroundClass}`}>
        <div className="absolute inset-0 p-6 flex flex-col justify-center">
          <h3 className="text-white font-bold text-xl mb-1">{title}</h3>
          <p className="text-white text-sm opacity-90 mb-3">Use code: {code}</p>
          <Button 
            onClick={handleClick}
            variant="secondary" 
            className="bg-white text-primary font-medium px-4 py-1.5 rounded-full w-max text-sm"
          >
            Order Now
          </Button>
        </div>
        {imageSrc && (
          <div className="absolute right-2 bottom-0">
            <img 
              src={imageSrc} 
              alt={title} 
              className="h-32 object-contain" 
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function PromoBannerCarousel() {
  const [banners, setBanners] = useState<PromoBannerProps[]>([
    {
      title: "First Order Free Delivery",
      description: "Get free delivery on your first order",
      code: "WELCOME10",
      backgroundClass: "bg-gradient-to-r from-violet-600 to-primary",
      imageSrc: "https://cdn-icons-png.flaticon.com/512/7818/7818018.png"
    },
    {
      title: "20% Off on Fresh Fruits",
      description: "Limited time offer on all fruits",
      code: "FRESH20",
      backgroundClass: "bg-gradient-to-r from-green-500 to-green-700",
      imageSrc: "https://cdn-icons-png.flaticon.com/512/3194/3194591.png"
    }
  ]);
  
  const [activeBanner, setActiveBanner] = useState(0);
  
  useEffect(() => {
    // Auto rotate banners every 5 seconds
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);
  
  return (
    <div className="relative">
      <PromoBanner {...banners[activeBanner]} />
      
      {/* Dots for navigation */}
      <div className="flex justify-center -mt-2 mb-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`mx-1 h-2 w-2 rounded-full ${
              index === activeBanner ? "bg-primary" : "bg-gray-300"
            }`}
            onClick={() => setActiveBanner(index)}
          />
        ))}
      </div>
    </div>
  );
}
