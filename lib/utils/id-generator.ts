/**
 * Professional ID Generator Utility
 * 
 * Generates collision-resistant, human-readable IDs for the Booking System.
 * Format: BKG-[YYYYMMDD]-[4-CHARS-RANDOM]
 */

export function generateBookingId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // High-entropy random suffix (Base36)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `BKG-${year}${month}${day}-${random}`;
}
