import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

const offers: Offer[] = [
  {
    id: 1,
    title: "Fresh Fruits Fest",
    description: "Up to 40% off on fresh fruits",
    image: "https://images.unsplash.com/photo-1612929633738-8fe6ace2afb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    link: "/category/1"
  },
  {
    id: 2,
    title: "Weekly Vegetable Sale",
    description: "Buy more save more",
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    link: "/category/2"
  },
  {
    id: 3,
    title: "Dairy Products Discount",
    description: "Fresh dairy at 30% off",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    link: "/category/3"
  }
];

export function OffersBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === offers.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? offers.length - 1 : prev - 1));
  };

  return (
    <section className="mb-8">
      <div className="relative rounded-xl overflow-hidden shadow-md">
        <div className="flex overflow-x-auto scroll-snap-x">
          <div className="flex-shrink-0 w-full scroll-snap-center">
            <img 
              src={offers[currentSlide].image} 
              alt={offers[currentSlide].title}
              className="w-full h-40 md:h-56 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="px-6 py-4 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  {offers[currentSlide].title}
                </h3>
                <p className="text-sm md:text-base mb-3">
                  {offers[currentSlide].description}
                </p>
                <Button className="bg-accent-500 hover:bg-accent-600 rounded-full">
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slider Controls */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white rounded-full shadow-md"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white rounded-full shadow-md"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Indicator Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {offers.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-white/90" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
