/**
 * Formats ISO datetime string to human-readable format
 * @param isoString - ISO 8601 datetime string
 * @returns Formatted date string (YYYY-MM-DD HH:MM)
 */
export function formatSessionDateTime(isoString: string): string {
  const date = new Date(isoString)
  
  // Extract date and time components
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * Formats ISO datetime string to time only (HH:MM)
 * @param isoString - ISO 8601 datetime string  
 * @returns Formatted time string (HH:MM)
 */
export function formatSessionTime(isoString: string): string {
  const date = new Date(isoString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${hours}:${minutes}`
}

/**
 * Formats ISO date string to DD.MM format
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string (DD.MM)
 */
export function formatDateShort(isoString: string): string {
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  return `${day}.${month}`
}

/**
 * Extracts date part from ISO datetime string (YYYY-MM-DD)
 * @param isoString - ISO 8601 datetime string
 * @returns Date string (YYYY-MM-DD)
 */
export function getDatePart(isoString: string): string {
  return isoString.slice(0, 10)
}
