import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@shared/schema";
import { API_ENDPOINTS, CATEGORY_ICONS } from "@shared/constants";

export default function CategoryScroller() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.CATEGORIES],
  });

  if (isLoading) {
    return (
      <div className="my-6">
        <h2 className="font-poppins font-semibold text-lg mb-3">Categories</h2>
        <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 min-w-[4.5rem]">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !categories) {
    return (
      <div className="my-6">
        <h2 className="font-poppins font-semibold text-lg mb-3">Categories</h2>
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm">
          Failed to load categories. Please try again.
        </div>
      </div>
    );
  }

  // Get the icon and color for each category
  const getCategoryStyle = (category: Category) => {
    const defaultIcon = "shopping_basket";
    const defaultColor = "#1e88e5"; // primary-600
    
    const name = category.name.toLowerCase();
    
    // Find matching category or default
    for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
      if (name.includes(key)) {
        return { icon: value.icon, color: value.color };
      }
    }
    
    return { icon: category.icon || defaultIcon, color: category.color || defaultColor };
  };

  return (
    <div className="my-6">
      <h2 className="font-poppins font-semibold text-lg mb-3">Categories</h2>
      <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((category) => {
          const { icon, color } = getCategoryStyle(category);
          
          return (
            <Link 
              key={category.id} 
              href={`/categories/${category.id}`}
            >
              <a className="flex flex-col items-center space-y-2 min-w-[4.5rem]">
                <div 
                  className="h-16 w-16 rounded-full flex items-center justify-center shadow-sm"
                  style={{ 
                    backgroundColor: `${color}20`, // 20% opacity version of the color
                  }}
                >
                  <span 
                    className="material-icons"
                    style={{ color }}
                  >
                    {icon}
                  </span>
                </div>
                <span className="text-xs text-center font-medium text-neutral-800 dark:text-neutral-300">
                  {category.name}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
