import { ArrowUp, ArrowDown, ShoppingBag, DollarSign, Clock, Bike } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  change?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
}

function StatCard({ title, value, icon, iconBg, change }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {change && (
          <div className="flex items-center mt-2 text-xs">
            <span className={`flex items-center ${change.isPositive ? 'text-accent-500' : 'text-red-500'}`}>
              {change.isPositive ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {Math.abs(change.value)}%
            </span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Today's Orders"
        value="128"
        icon={<ShoppingBag className="text-primary-500 h-5 w-5" />}
        iconBg="bg-primary-100 dark:bg-primary-900"
        change={{
          value: 12.5,
          isPositive: true,
          label: "vs yesterday"
        }}
      />
      <StatCard
        title="Revenue"
        value={formatCurrency(45290)}
        icon={<DollarSign className="text-green-500 h-5 w-5" />}
        iconBg="bg-green-100 dark:bg-green-900"
        change={{
          value: 8.2,
          isPositive: true,
          label: "vs yesterday"
        }}
      />
      <StatCard
        title="Avg. Delivery Time"
        value="9.2 min"
        icon={<Clock className="text-blue-500 h-5 w-5" />}
        iconBg="bg-blue-100 dark:bg-blue-900"
        change={{
          value: 0.5,
          isPositive: false,
          label: "vs yesterday"
        }}
      />
      <StatCard
        title="Active Riders"
        value="28"
        icon={<Bike className="text-yellow-500 h-5 w-5" />}
        iconBg="bg-yellow-100 dark:bg-yellow-900"
        change={{
          value: 3,
          isPositive: true,
          label: "vs yesterday"
        }}
      />
    </div>
  );
}
