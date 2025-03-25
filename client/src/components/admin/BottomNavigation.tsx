import { Link, useLocation } from "wouter";

export default function AdminBottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border py-2">
      <div className="container mx-auto flex justify-around items-center">
        <Link href="/admin">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/5">
            <span className={`material-icons ${location === "/admin" ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`}>
              dashboard
            </span>
            <span className={`text-xs ${location === "/admin" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-500 dark:text-neutral-400"}`}>
              Dashboard
            </span>
          </a>
        </Link>
        <Link href="/admin/orders">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/5">
            <span className={`material-icons ${location === "/admin/orders" ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`}>
              shopping_bag
            </span>
            <span className={`text-xs ${location === "/admin/orders" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-500 dark:text-neutral-400"}`}>
              Orders
            </span>
          </a>
        </Link>
        <Link href="/admin/products">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/5">
            <span className={`material-icons ${location === "/admin/products" ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`}>
              category
            </span>
            <span className={`text-xs ${location === "/admin/products" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-500 dark:text-neutral-400"}`}>
              Products
            </span>
          </a>
        </Link>
        <Link href="/admin/delivery">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/5">
            <span className={`material-icons ${location === "/admin/delivery" ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`}>
              delivery_dining
            </span>
            <span className={`text-xs ${location === "/admin/delivery" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-500 dark:text-neutral-400"}`}>
              Delivery
            </span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/5">
            <span className="material-icons text-neutral-500 dark:text-neutral-400">
              home
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Customer
            </span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
