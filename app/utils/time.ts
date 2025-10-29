export function remainingSeconds(bookedAt: string | number | Date, timeoutSeconds: number, nowMs: number): number {
  const booked = new Date(bookedAt).getTime()
  return Math.max(0, Math.floor((booked + timeoutSeconds * 1000 - nowMs) / 1000))
}

export const isTimeInFuture = (timeString: string): boolean => {
  return new Date(timeString) > new Date()
}

export const isTimeInPast = (timeString: string): boolean => {
  return new Date(timeString) < new Date()
}
