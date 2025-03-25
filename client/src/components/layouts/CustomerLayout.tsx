import React, { ReactNode, useState } from "react";
import Header from "../customer/Header";
import BottomNavigation from "../customer/BottomNavigation";
import CartModal from "../customer/CartModal";
import OTPModal from "../customer/OTPModal";
import OrderTrackingModal from "../customer/OrderTrackingModal";

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const openTrackingModal = (orderId: string) => {
    setTrackingOrderId(orderId);
    setIsTrackingOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-1 pb-16">
        {children}
      </main>
      
      <BottomNavigation 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <CartModal 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      
      <OTPModal 
        isOpen={isOTPModalOpen} 
        onClose={() => setIsOTPModalOpen(false)} 
      />
      
      <OrderTrackingModal 
        isOpen={isTrackingOpen} 
        orderId={trackingOrderId}
        onClose={() => setIsTrackingOpen(false)} 
      />
    </div>
  );
}
