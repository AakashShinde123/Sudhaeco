import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
}

export default function AnalyticsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  change,
}: AnalyticsCardProps) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor}`}>
            <i className={`${icon} text-xl`}></i>
          </div>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        {change && (
          <p className={`text-sm ${change.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center mt-2`}>
            <i className={`${change.isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
            <span>{change.value}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
