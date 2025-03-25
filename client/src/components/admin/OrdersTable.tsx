import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Order, OrderItem } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  preparing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  packed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  out_for_delivery: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

interface OrderWithItems extends Order {
  items: OrderItem[];
}

interface OrdersTableProps {
  limit?: number;
  title?: string;
  showViewAll?: boolean;
}

export function OrdersTable({ limit = 5, title = "Recent Orders", showViewAll = true }: OrdersTableProps) {
  const { data: orders, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders']
  });

  const displayOrders = limit && orders ? orders.slice(0, limit) : orders;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold">{title}</h2>
        {showViewAll && (
          <Button variant="link" className="text-primary hover:text-primary/90 font-medium text-sm">
            View All
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: limit }).map((_, index) => (
              <div key={index} className="flex justify-between items-center">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            Failed to load orders
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>User #{order.userId}</TableCell>
                  <TableCell>{order.items?.length || 0} items</TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" className="text-primary hover:text-primary/90 font-medium p-0 h-auto">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!displayOrders || displayOrders.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
