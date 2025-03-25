import axios from 'axios';

/**
 * Sends SMS via Fast2SMS API
 * @param phoneNumber Phone number to send SMS to (without country code)
 * @param message Message content
 * @returns Promise resolving to API response
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<any> {
  // Get API key from environment variable
  const apiKey = process.env.FAST2SMS_API_KEY;
  
  if (!apiKey) {
    throw new Error('FAST2SMS_API_KEY environment variable not set');
  }
  
  // Format phone number (remove any non-digit characters)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      data: {
        variables_values: message,
        route: 'otp',
        numbers: formattedPhone
      }
    });
    
    if (response.data.return === false) {
      throw new Error(response.data.message || 'Failed to send SMS');
    }
    
    return response.data;
  } catch (error) {
    console.error('Fast2SMS API error:', error);
    throw error;
  }
}
