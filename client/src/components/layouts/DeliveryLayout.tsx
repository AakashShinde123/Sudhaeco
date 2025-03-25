import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface DeliveryLayoutProps {
  children: ReactNode;
}

export default function DeliveryLayout({ children }: DeliveryLayoutProps) {
  const { userData, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-primary text-white shadow-sm py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Speedy Delivery</h1>
            {userData && (
              <div className="py-1 px-3 bg-white bg-opacity-20 rounded-full text-sm">
                {userData.name}
              </div>
            )}
          </div>
          <button onClick={() => logout()} className="text-white">
            <i className="ri-logout-box-line text-xl"></i>
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        {children}
      </main>
      
      <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around px-2 py-2">
          <Link href="/delivery/home">
            <a className={`flex flex-col items-center justify-center w-full py-1 ${location === '/delivery/home' ? 'text-primary' : 'text-gray-500'}`}>
              <i className="ri-home-5-line text-xl"></i>
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          
          <Link href="/delivery/current">
            <a className={`flex flex-col items-center justify-center w-full py-1 ${location === '/delivery/current' ? 'text-primary' : 'text-gray-500'}`}>
              <i className="ri-motorcycle-line text-xl"></i>
              <span className="text-xs mt-1">Current</span>
            </a>
          </Link>
          
          <Link href="/delivery/history">
            <a className={`flex flex-col items-center justify-center w-full py-1 ${location === '/delivery/history' ? 'text-primary' : 'text-gray-500'}`}>
              <i className="ri-history-line text-xl"></i>
              <span className="text-xs mt-1">History</span>
            </a>
          </Link>
          
          <Link href="/delivery/earnings">
            <a className={`flex flex-col items-center justify-center w-full py-1 ${location === '/delivery/earnings' ? 'text-primary' : 'text-gray-500'}`}>
              <i className="ri-wallet-3-line text-xl"></i>
              <span className="text-xs mt-1">Earnings</span>
            </a>
          </Link>
        </div>
      </nav>
    </div>
  );
}
