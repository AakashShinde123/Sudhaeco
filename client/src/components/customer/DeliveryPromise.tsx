import { DEFAULT_DELIVERY_TIME_MIN } from "@shared/constants";

export default function DeliveryPromise() {
  return (
    <div className="my-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 flex items-center justify-between">
      <div>
        <h3 className="font-poppins font-medium text-primary-700 dark:text-primary-400">{DEFAULT_DELIVERY_TIME_MIN}-Minute Delivery</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Order now and get it in {DEFAULT_DELIVERY_TIME_MIN} minutes!</p>
      </div>
      <div className="bg-white dark:bg-dark-surface rounded-full h-12 w-12 flex items-center justify-center shadow-md">
        <span className="material-icons text-primary-600 dark:text-primary-400">timer</span>
      </div>
    </div>
  );
}
