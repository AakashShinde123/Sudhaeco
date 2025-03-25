import { Link, useLocation } from "wouter";

export function Footer() {
  const [location] = useLocation();
  
  const isAdminRoute = location.startsWith("/admin");
  const isDeliveryRoute = location.startsWith("/delivery");
  
  // Don't show footer on admin or delivery routes
  if (isAdminRoute || isDeliveryRoute) {
    return null;
  }

  // Mobile navigation footer
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
      <div className="flex justify-around">
        <div className={`flex flex-col items-center py-2 ${location === "/" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
          <Link href="/">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 cursor-pointer" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="text-xs mt-1 cursor-pointer">Home</span>
          </Link>
        </div>
        
        <div className={`flex flex-col items-center py-2 ${location === "/search" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
          <Link href="/search">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 cursor-pointer" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <span className="text-xs mt-1 cursor-pointer">Search</span>
          </Link>
        </div>
        
        <div className={`flex flex-col items-center py-2 ${location === "/orders" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
          <Link href="/orders">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 cursor-pointer" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 6a2 2 0 1 0-4 0c0 1.11.89 2 2 2h2c1.11 0 2 .89 2 2a2 2 0 1 1-4 0"/>
              <path d="M14 9h-2.5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2H14"/>
              <path d="M5 8h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-.5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1H9"/>
              <path d="M17 12a2 2 0 0 1 2 2c0 1.15-.77 2-2 2"/>
              <rect width="20" height="14" x="2" y="5" rx="2"/>
            </svg>
            <span className="text-xs mt-1 cursor-pointer">Orders</span>
          </Link>
        </div>
        
        <div className={`flex flex-col items-center py-2 ${location === "/profile" ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}>
          <Link href="/profile">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 cursor-pointer" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-xs mt-1 cursor-pointer">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
