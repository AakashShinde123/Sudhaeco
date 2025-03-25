import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

export default function AdminHeader() {
  const { toggleTheme } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-surface shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <a className="flex items-center space-x-3">
              <div className="text-primary-600 dark:text-primary-400 font-poppins font-bold text-xl">Admin Dashboard</div>
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
            <Link href="/profile">
              <a className="flex items-center space-x-1 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-dark-border">
                <span className="material-icons text-neutral-600 dark:text-neutral-300">
                  account_circle
                </span>
                <span className="text-sm text-neutral-600 dark:text-neutral-300">Admin</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
