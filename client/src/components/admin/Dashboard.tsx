import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Bike 
} from "lucide-react";
import { Order } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  iconBgColor: string;
  changeColor: "text-green-600" | "text-red-600";
}

function StatCard({ title, value, change, icon, iconBgColor, changeColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className={`text-sm ${changeColor} flex items-center mt-2`}>
        <i className={`ri-arrow-${changeColor === 'text-green-600' ? 'up' : 'down'}-line mr-1`}></i>
        <span>{change}</span>
      </p>
    </div>
  );
}

export function Dashboard() {
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Calculated stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    avgDeliveryTime: 0,
    activeRiders: 0,
  });

  // Calculate stats based on orders data
  useEffect(() => {
    if (orders && orders.length > 0) {
      // Total orders is just the count
      const totalOrders = orders.length;
      
      // Calculate total revenue
      const revenue = orders.reduce((total, order) => total + order.total, 0);
      
      // Calculate avg delivery time (for orders with estimatedDeliveryTime)
      const ordersWithTime = orders.filter(order => order.estimatedDeliveryTime);
      const avgDeliveryTime = ordersWithTime.length > 0
        ? Math.round(ordersWithTime.reduce((sum, order) => sum + order.estimatedDeliveryTime, 0) / ordersWithTime.length)
        : 10; // Default to 10 minutes if no data
      
      // Active riders (unique delivery partner IDs in non-completed orders)
      const activeDeliveryPartners = new Set();
      orders
        .filter(order => order.status !== 'delivered' && order.deliveryPartnerId)
        .forEach(order => activeDeliveryPartners.add(order.deliveryPartnerId));
      
      setStats({
        totalOrders,
        revenue,
        avgDeliveryTime,
        activeRiders: activeDeliveryPartners.size || 24, // Default to 24 if no data
      });
    }
  }, [orders]);

  // Dummy data for charts (would be calculated from real data in production)
  const orderChartData = [
    { name: '6 AM', orders: 12 },
    { name: '8 AM', orders: 19 },
    { name: '10 AM', orders: 37 },
    { name: '12 PM', orders: 43 },
    { name: '2 PM', orders: 29 },
    { name: '4 PM', orders: 33 },
    { name: '6 PM', orders: 48 },
    { name: '8 PM', orders: 35 },
  ];

  // Category distribution data (would come from API in production)
  const categoryData = [
    { name: 'Fruits', value: 28 },
    { name: 'Vegetables', value: 22 },
    { name: 'Dairy', value: 18 },
    { name: 'Bakery', value: 15 },
    { name: 'Snacks', value: 10 },
    { name: 'Beverages', value: 7 },
  ];

  const COLORS = ['#6200EA', '#00C853', '#2979FF', '#FF9100', '#F44336', '#9C27B0'];

  if (isOrdersLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders.toString()}
          change="+24% from yesterday"
          icon={<ShoppingBag className="text-primary text-xl" />}
          iconBgColor="bg-primary bg-opacity-10"
          changeColor="text-green-600"
        />
        
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          change="+18% from yesterday"
          icon={<DollarSign className="text-green-600 text-xl" />}
          iconBgColor="bg-green-100"
          changeColor="text-green-600"
        />
        
        <StatCard
          title="Avg. Delivery Time"
          value={`${stats.avgDeliveryTime} min`}
          change="-5% from yesterday"
          icon={<Clock className="text-amber-600 text-xl" />}
          iconBgColor="bg-amber-100"
          changeColor="text-green-600"
        />
        
        <StatCard
          title="Active Riders"
          value={stats.activeRiders.toString()}
          change="-2 from yesterday"
          icon={<Bike className="text-blue-600 text-xl" />}
          iconBgColor="bg-blue-100"
          changeColor="text-red-600"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Orders Overview</h3>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Bar dataKey="orders" fill="#6200EA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Top Categories</h3>
            <button className="text-primary text-sm">View All</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
