import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@shared/schema";

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

function CategoryItem({ category, isActive, onClick }: CategoryItemProps) {
  return (
    <div 
      className="flex flex-col items-center cursor-pointer"
      onClick={onClick}
    >
      <div 
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-1 ${
          isActive ? 'bg-primary text-white' : `bg-opacity-10`
        }`}
        style={{ 
          backgroundColor: isActive ? category.color : `${category.color}20`
        }}
      >
        <i className={`${category.icon} ${isActive ? 'text-white' : ''} text-xl`}></i>
      </div>
      <span className="text-xs font-medium">{category.name}</span>
    </div>
  );
}

interface CategoryListProps {
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
}

export function CategoryList({ onCategorySelect, selectedCategoryId = null }: CategoryListProps) {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Handle category selection
  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategoryId === categoryId) {
      // If clicking on the already selected category, deselect it
      onCategorySelect(null);
    } else {
      // Otherwise select the new category
      onCategorySelect(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="py-3">
        <div className="px-4 mb-2">
          <h2 className="font-bold text-lg">Categories</h2>
        </div>
        <div className="hide-scrollbar overflow-x-auto">
          <div className="inline-flex px-4 space-x-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full mb-1" />
                <Skeleton className="w-12 h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !categories) {
    return (
      <div className="py-3 px-4">
        <div className="text-red-500">Failed to load categories</div>
      </div>
    );
  }

  return (
    <div className="py-3">
      <div className="px-4 mb-2">
        <h2 className="font-bold text-lg">Categories</h2>
      </div>
      <div className="hide-scrollbar overflow-x-auto">
        <div className="inline-flex px-4 space-x-4">
          {categories.map((category: Category) => (
            <CategoryItem 
              key={category.id}
              category={category}
              isActive={selectedCategoryId === category.id}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
