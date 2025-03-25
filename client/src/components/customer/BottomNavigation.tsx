import { useLocation, Link } from "wouter";
import { Home, Search, ShoppingCart, User } from "lucide-react";

interface BottomNavigationProps {
  onCartOpen: () => void;
  onSearchOpen?: () => void;
}

export function BottomNavigation({ onCartOpen, onSearchOpen }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around px-2 py-2">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center w-full py-1 ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </a>
        </Link>
        <a 
          className="flex flex-col items-center justify-center w-full py-1 text-gray-500"
          onClick={onSearchOpen}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </a>
        <a 
          className="flex flex-col items-center justify-center w-full py-1 text-gray-500"
          onClick={onCartOpen}
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-xs mt-1">Cart</span>
        </a>
        <Link href="/auth">
          <a className={`flex flex-col items-center justify-center w-full py-1 ${location === '/auth' ? 'text-primary' : 'text-gray-500'}`}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Account</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
