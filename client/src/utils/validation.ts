/**
 * Validate Indian phone number (10 digits)
 * @param phone Phone number to validate
 * @returns Boolean indicating if phone number is valid
 */
export function validatePhone(phone: string): boolean {
  // Remove any non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a 10-digit number
  if (cleaned.length === 10) {
    return true;
  }
  
  // If it has country code, it should be 12 digits starting with 91
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return true;
  }
  
  return false;
}

/**
 * Validate email address
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
}

/**
 * Validate if the input is not empty
 * @param value Value to check
 * @returns Boolean indicating if value is not empty
 */
export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate minimum length of a string
 * @param value Value to check
 * @param minLength Minimum length required
 * @returns Boolean indicating if value meets minimum length
 */
export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Validate maximum length of a string
 * @param value Value to check
 * @param maxLength Maximum length allowed
 * @returns Boolean indicating if value is within maximum length
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Validate if a number is within range
 * @param value Value to check
 * @param min Minimum value
 * @param max Maximum value
 * @returns Boolean indicating if value is within range
 */
export function validateNumberRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate OTP (4 digits)
 * @param otp OTP to validate
 * @returns Boolean indicating if OTP is valid
 */
export function validateOTP(otp: string): boolean {
  return /^\d{4}$/.test(otp);
}

/**
 * Validate password complexity
 * @param password Password to validate
 * @returns Boolean indicating if password meets complexity requirements
 */
export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate Indian PIN code (6 digits)
 * @param pincode PIN code to validate
 * @returns Boolean indicating if PIN code is valid
 */
export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode);
}

/**
 * Validate URL
 * @param url URL to validate
 * @returns Boolean indicating if URL is valid
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
