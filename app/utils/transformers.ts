import type { Movie, Session, SessionDetail, Booking } from '~/schemas'

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i
const DEFAULT_API_BASE = 'http://localhost:3022'

const resolveApiBaseUrl = (fallback?: string): string => {
  if (fallback) {
    return fallback
  }
  try {
    const { public: { apiBase } } = useRuntimeConfig()
    return apiBase
  } catch {
    return DEFAULT_API_BASE
  }
}

/**
 * Get full poster URL by prepending API host
 */
export function getPosterUrl(posterPath: string | undefined, apiBase?: string): string | undefined {
  if (!posterPath) {
    return undefined
  }

  if (ABSOLUTE_URL_PATTERN.test(posterPath)) {
    return posterPath
  }

  const baseUrl = resolveApiBaseUrl(apiBase)
  try {
    return new URL(posterPath, baseUrl).toString()
  } catch {
    return undefined
  }
}

/**
 * Normalizes movie data to handle inconsistent backend field names
 * Ensures consistent shape across the application
 */
export function normalizeMovie(movie: Movie, apiBase?: string): Movie {
  const posterSource = movie.posterFullUrl ?? movie.posterImage
  const resolvedPoster = getPosterUrl(posterSource, apiBase)

  return {
    ...movie,
    posterFullUrl: resolvedPoster ?? movie.posterFullUrl // Full URL for images
  }
}

/**
 * Normalizes session data with consistent field mapping
 */
export function normalizeSession(raw: unknown): Session {
  const session = raw as Session
  
  return {
    ...session
    // No fallbacks needed - schema guarantees all fields exist
  }
}

/**
 * Groups sessions by date for display
 */
export function groupSessionsByDate(sessions: Session[]): Record<string, Session[]> {
  const grouped: Record<string, Session[]> = {}
  
  for (const session of sessions) {
    const normalizedSession = normalizeSession(session)
    const date = (normalizedSession.startAt || normalizedSession.startTime || '').slice(0, 10)
    
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(normalizedSession)
  }
  
  return grouped
}

/**
 * Normalizes booking data for consistent display
 */
export function normalizeBooking(raw: unknown): Booking {
  const booking = raw as Booking
  
  return {
    ...booking
    // No fallbacks needed - schema guarantees all fields exist
  }
}

/**
 * Normalizes session detail data for seat selection
 */
export function normalizeSessionDetail(raw: unknown): SessionDetail {
  const detail = raw as SessionDetail
  
  return {
    ...detail
    // No fallbacks needed - schema guarantees all fields exist
  }
}
