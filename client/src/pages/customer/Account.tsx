import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserOrders } from "@/hooks/useOrders";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, formatDatetime, getOrderStatus } from "@/lib/utils";

export default function Account() {
  const { userData, logout, isLoading } = useAuth();
  const { data: orders } = useUserOrders(userData?.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [address, setAddress] = useState(userData?.address || "");
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleSaveProfile = () => {
    // In a real app, we would save this data to the backend
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated",
    });
    setIsEditing(false);
  };

  const handleViewOrder = (orderId: number) => {
    setLocation(`/track/${orderId}`);
  };

  const handleLogout = () => {
    logout();
    setLocation("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-[70vh]">
        <i className="ri-loader-4-line animate-spin text-primary text-3xl"></i>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[70vh] text-center">
        <i className="ri-user-line text-gray-300 text-5xl mb-4"></i>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Not Logged In</h2>
        <p className="text-gray-500 mb-6">Please login to view your account</p>
        <Button 
          className="bg-primary"
          onClick={() => setLocation("/auth/login")}
        >
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          {!isEditing ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mr-4 text-xl font-bold">
                  {userData.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userData.name}</h2>
                  <p className="text-gray-500">{userData.phone}</p>
                </div>
                <Button 
                  variant="ghost" 
                  className="ml-auto"
                  onClick={handleEditProfile}
                >
                  <i className="ri-edit-line"></i>
                </Button>
              </div>

              <div className="space-y-2">
                {userData.email && (
                  <div className="flex items-start">
                    <i className="ri-mail-line text-gray-400 mt-0.5 mr-2"></i>
                    <span>{userData.email}</span>
                  </div>
                )}
                {userData.address && (
                  <div className="flex items-start">
                    <i className="ri-map-pin-line text-gray-400 mt-0.5 mr-2"></i>
                    <span>{userData.address}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Edit Profile</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Your address"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-primary"
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">My Orders</h2>
      
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getOrderStatus(order.status);
            const orderNumber = `SPDY${order.id.toString().padStart(5, '0')}`;
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">Order #{orderNumber}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{formatPrice(order.total)}</span>
                      <span className="text-sm text-gray-500">
                        {formatDatetime(order.createdAt, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-1 mb-3">
                      {order.items?.slice(0, 2).map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.items && order.items.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      {order.status === 'pending' || order.status === 'packed' || order.status === 'shipped' ? (
                        <>Track Order</>
                      ) : (
                        <>View Details</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <i className="ri-shopping-bag-line text-gray-300 text-4xl mb-2"></i>
          <p className="text-gray-500">You haven't placed any orders yet</p>
          <Button 
            variant="link" 
            className="mt-2 text-primary"
            onClick={() => setLocation("/")}
          >
            Start Shopping
          </Button>
        </div>
      )}

      <div className="mt-8">
        <Separator className="mb-6" />
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLogout}
        >
          <i className="ri-logout-box-line mr-2"></i>
          Logout
        </Button>
      </div>
    </div>
  );
}
