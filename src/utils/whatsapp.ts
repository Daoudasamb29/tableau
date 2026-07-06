/**
 * Generates a clean, direct WhatsApp click-to-chat URL.
 * It automatically strips non-digits and appends the Senegal country code (221)
 * if the phone number is 9 digits (common local mobile format in Senegal).
 */
export function getWhatsAppLink(phone: string, message: string): string {
  if (!phone) return '#';
  
  // Keep only digits
  let cleaned = phone.replace(/\D/g, '');
  
  // If it's a typical local number in Senegal (9 digits, starts with 7 or 3)
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('3'))) {
    cleaned = '221' + cleaned;
  }
  
  // Fallback in case it's completely empty after cleaning
  if (!cleaned) return '#';

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encodedMessage}`;
}
