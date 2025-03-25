/**
 * Format currency to Indian Rupees (INR)
 * @param amount Amount to format
 * @returns Formatted amount string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to localized string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time to localized string
 * @param date Date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format phone number to standard Indian format
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a 10-digit number
  if (cleaned.length === 10) {
    return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
  }
  
  // If it already has country code
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+91 ${cleaned.substring(2, 7)} ${cleaned.substring(7)}`;
  }
  
  // If it doesn't match any pattern, return as is
  return phone;
}

/**
 * Format order ID with leading zeros
 * @param id Order ID
 * @param padLength Length to pad to
 * @returns Formatted order ID
 */
export function formatOrderId(id: number, padLength = 4): string {
  return `#${id.toString().padStart(padLength, '0')}`;
}

/**
 * Format file size from bytes to human-readable format
 * @param bytes Size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration in minutes
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}
