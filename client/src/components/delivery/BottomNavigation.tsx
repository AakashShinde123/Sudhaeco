import { Link, useLocation } from "wouter";

export default function DeliveryBottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-surface border-t border-neutral-200 dark:border-dark-border py-2">
      <div className="container mx-auto flex justify-around items-center">
        <Link href="/delivery">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/4">
            <span className={`material-icons ${location === "/delivery" ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`}>
              home
            </span>
            <span className={`text-xs ${location === "/delivery" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-500 dark:text-neutral-400"}`}>
              Home
            </span>
          </a>
        </Link>
        <Link href="/delivery/history">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/4">
            <span className={`material-icons ${location === "/delivery/history" ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`}>
              history
            </span>
            <span className={`text-xs ${location === "/delivery/history" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-500 dark:text-neutral-400"}`}>
              History
            </span>
          </a>
        </Link>
        <Link href="/delivery/earnings">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/4">
            <span className={`material-icons ${location === "/delivery/earnings" ? "text-primary-600 dark:text-primary-400" : "text-neutral-500 dark:text-neutral-400"}`}>
              account_balance_wallet
            </span>
            <span className={`text-xs ${location === "/delivery/earnings" ? "text-primary-600 dark:text-primary-400 font-medium" : "text-neutral-500 dark:text-neutral-400"}`}>
              Earnings
            </span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center justify-center space-y-1 w-1/4">
            <span className="material-icons text-neutral-500 dark:text-neutral-400">
              shopping_bag
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
