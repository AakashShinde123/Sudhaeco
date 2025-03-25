import React from "react";
import { Category } from "@shared/schema";

interface CategoryChartProps {
  categories: {
    category: Category;
    percentage: number;
  }[];
}

export default function CategoryChart({ categories }: CategoryChartProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center h-full">
        <i className="ri-bar-chart-line text-4xl text-gray-300 mb-2"></i>
        <p className="text-gray-500">No category data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Top Categories</h3>
        <button className="text-primary text-sm">View All</button>
      </div>
      <div className="space-y-4">
        {categories.map(({ category, percentage }) => (
          <div key={category.id} className="flex items-center">
            <div 
              className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3`}
              style={{ 
                backgroundColor: `${category.color}20`, // Adding 20% opacity
                color: category.color 
              }}
            >
              <i className={`${category.icon}`}></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: category.color 
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
