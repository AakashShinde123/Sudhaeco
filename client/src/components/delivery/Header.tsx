import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

export default function DeliveryHeader() {
  const { toggleTheme } = useAuth();
  const isOnline = true; // This would come from a delivery partner's status context

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-surface shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/delivery">
            <a className="flex items-center space-x-3">
              <div className="text-primary-600 dark:text-primary-400 font-poppins font-bold text-xl">Delivery Partner</div>
              <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
            </a>
          </Link>
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <span className="material-icons text-neutral-600 dark:text-neutral-300">
                dark_mode
              </span>
            </button>
            <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border">
              <span className="material-icons text-neutral-600 dark:text-neutral-300">
                notifications
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
