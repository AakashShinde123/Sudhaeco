import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";

// Dummy data for earnings chart
const earningsData = [
  { date: "Mon", amount: 120 },
  { date: "Tue", amount: 180 },
  { date: "Wed", amount: 150 },
  { date: "Thu", amount: 220 },
  { date: "Fri", amount: 280 },
  { date: "Sat", amount: 340 },
  { date: "Sun", amount: 200 },
];

export default function Earnings() {
  const [, setLocation] = useLocation();
  const { userData } = useAuth();
  const [period, setPeriod] = useState("week");

  // Get delivery partner details
  const { data: deliveryPartner, isLoading: isLoadingPartner } = useQuery({
    queryKey: [`/api/delivery/partners/by-user/${userData?.id}`],
    select: (data) => data as any,
    enabled: !!userData?.id,
  });

  // Get earnings data
  const { data: earnings, isLoading: isLoadingEarnings } = useQuery({
    queryKey: [`/api/delivery/partners/${deliveryPartner?.id}/earnings`],
    select: (data) => data as any,
    enabled: !!deliveryPartner?.id,
  });

  // Loading state
  if (isLoadingPartner || isLoadingEarnings) {
    return (
      <div className="p-4 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary mb-2"></i>
          <p>Loading earnings data...</p>
        </div>
      </div>
    );
  }

  // If no delivery partner found
  if (!deliveryPartner?.id) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh] text-center">
        <i className="ri-error-warning-line text-5xl text-amber-500 mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">Account Not Found</h1>
        <p className="text-gray-600 mb-6">
          You don't have a delivery partner account. Please contact the administrator.
        </p>
        <Button onClick={() => setLocation("/delivery/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  // If earning data couldn't be loaded
  if (!earnings) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[80vh] text-center">
        <i className="ri-error-warning-line text-5xl text-amber-500 mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">Couldn't Load Earnings</h1>
        <p className="text-gray-600 mb-6">
          We're having trouble loading your earnings data. Please try again later.
        </p>
        <Button onClick={() => setLocation("/delivery/home")}>
          Back to Home
        </Button>
      </div>
    );
  }

  // Find the maximum value for scaling the chart
  const maxEarning = Math.max(...earningsData.map(day => day.amount));

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Your Earnings</h1>
        
        <Select
          value={period}
          onValueChange={setPeriod}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="This Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Earnings Summary Card */}
      <Card className="mb-6 bg-primary text-white">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-1 opacity-90">Total Earnings</h2>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">₹{earnings.totalEarnings.toFixed(2)}</span>
            <span className="ml-2 text-sm opacity-75">Lifetime</span>
          </div>
          <Separator className="my-4 bg-white/20" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-75">Today</p>
              <p className="text-xl font-bold">₹{earnings.todayEarnings.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Yesterday</p>
              <p className="text-xl font-bold">₹{earnings.yesterdayEarnings.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">This Week</p>
              <p className="text-xl font-bold">₹{earnings.lastWeekEarnings.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Chart */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-4">Earnings Breakdown</h2>
          <div className="h-44">
            <div className="flex h-36 items-end justify-between">
              {earningsData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 bg-primary rounded-t" 
                    style={{ 
                      height: `${(day.amount / maxEarning) * 100}%`,
                      opacity: period === "week" ? 1 : 0.7
                    }}
                  ></div>
                  <p className="text-xs mt-1">{day.date}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Stats */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-4">Delivery Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Deliveries Completed</p>
              <p className="text-2xl font-bold">{earnings.deliveriesCompleted}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500">Total Deliveries</p>
              <p className="text-2xl font-bold">{earnings.totalDeliveries}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-2">Your Rating</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-3xl font-bold mr-2">{earnings.rating.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i 
                    key={star}
                    className={`${star <= Math.round(earnings.rating) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'} text-xl`}
                  ></i>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Based on customer ratings
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Insights */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-bold mb-2">Tips to Increase Earnings</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
              <span>Stay available during peak hours (12pm-2pm, 7pm-9pm)</span>
            </li>
            <li className="flex items-start">
              <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
              <span>Complete deliveries quickly to take more orders</span>
            </li>
            <li className="flex items-start">
              <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
              <span>Maintain high ratings by providing excellent service</span>
            </li>
            <li className="flex items-start">
              <i className="ri-check-line text-green-500 mr-2 mt-0.5"></i>
              <span>Weekend deliveries typically have higher volume</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
