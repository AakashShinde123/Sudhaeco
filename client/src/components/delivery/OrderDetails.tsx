import React from "react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDatetime, getOrderStatus } from "@/lib/utils";
import { Order } from "@shared/schema";
import { Separator } from "@/components/ui/separator";

interface OrderDetailsProps {
  order: Order;
  isActive?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onDeliver?: () => void;
  onCallCustomer?: () => void;
}

export default function OrderDetails({
  order,
  isActive = false,
  onAccept,
  onReject,
  onDeliver,
  onCallCustomer,
}: OrderDetailsProps) {
  const orderStatus = getOrderStatus(order.status);
  const orderNumber = `SPDY${order.id.toString().padStart(5, "0")}`;
  const orderItems = order.items || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600">Order #{orderNumber}</span>
          <h3 className="font-bold text-lg">
            {formatPrice(order.total)}
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}
        >
          {orderStatus.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-start space-x-2">
          <i className="ri-map-pin-2-line text-gray-500 mt-0.5"></i>
          <div>
            <p className="text-sm font-medium">Delivery Address</p>
            <p className="text-sm text-gray-600">{order.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-start space-x-2">
          <i className="ri-time-line text-gray-500 mt-0.5"></i>
          <div>
            <p className="text-sm font-medium">Order Time</p>
            <p className="text-sm text-gray-600">
              {formatDatetime(order.createdAt, {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <p className="font-medium mb-2">Order Items</p>
        {orderItems.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center py-1">
            <div className="flex items-center">
              <span className="text-gray-600 text-sm mr-2">{item.quantity}x</span>
              <span className="text-sm">{item.productName}</span>
            </div>
            <span className="text-sm font-medium">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm">{formatPrice(order.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Delivery Fee</span>
          <span className="text-sm">{formatPrice(order.deliveryFee)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Discount</span>
            <span className="text-sm text-green-600">
              -{formatPrice(order.discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between font-medium pt-2">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Action buttons based on order state */}
      {order.status === "packed" && !isActive && (
        <div className="mt-4 flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700"
            onClick={onReject}
          >
            Reject
          </Button>
          <Button className="flex-1 bg-primary" onClick={onAccept}>
            Accept Order
          </Button>
        </div>
      )}

      {order.status === "shipped" && isActive && (
        <div className="mt-4 flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700"
            onClick={onCallCustomer}
          >
            <i className="ri-phone-line mr-1"></i>
            Call Customer
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={onDeliver}>
            <i className="ri-check-double-line mr-1"></i>
            Mark as Delivered
          </Button>
        </div>
      )}
    </div>
  );
}
