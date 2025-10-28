import type { Movie, Session, SessionDetail, Booking } from '~/schemas'

// Get API base URL for constructing full image URLs
const getApiBaseUrl = () => {
  if (import.meta.server) {
    return useRequestURL().origin
  }
  return 'http://localhost:3022'
}

/**
 * Get full poster URL by prepending API host
 */
export function getPosterUrl(posterPath: string | undefined): string | undefined {
  if (!posterPath) return undefined
  if (posterPath.startsWith('http')) return posterPath
  return `${getApiBaseUrl()}${posterPath}`
}

/**
 * Normalizes movie data to handle inconsistent backend field names
 * Ensures consistent shape across the application
 */
export function normalizeMovie(raw: unknown): Movie {
  // Type assertion aligns with Zod schema validation in schemas/index.ts
  const movie = raw as Movie
  
  return {
    id: movie.id,
    title: movie.title || movie.name,
    posterImage: movie.posterImage, // API field
    posterUrl: movie.posterUrl || movie.posterImage, // Fallback
    posterFullUrl: movie.posterImage ? getPosterUrl(movie.posterImage) : undefined, // Full URL for images
    description: movie.description,
    duration: movie.duration || movie.runtime,
    lengthMinutes: movie.lengthMinutes, // API field
    rating: movie.rating,
    year: movie.year,
    name: movie.name // Preserve original for backward compatibility
  }
}

/**
 * Normalizes session data with consistent field mapping
 */
export function normalizeSession(raw: unknown): Session {
  const session = raw as Session
  
  return {
    id: session.id,
    movieId: session.movieId,
    cinemaId: session.cinemaId,
    startTime: session.startTime || session.startAt || session.start_time,
    startAt: session.startAt || session.startTime || session.start_time,
    cinemaName: session.cinemaName || session.cinema?.name,
    movieName: session.movieName || session.movie?.title,
    cinema: session.cinema,
    movie: session.movie
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
    ...booking,
    movieName: booking.movieName || booking.movie?.title,
    cinemaName: booking.cinemaName || booking.cinema?.name,
    startAt: booking.startAt || booking.time
  }
}

/**
 * Normalizes session detail data for seat selection
 */
export function normalizeSessionDetail(raw: unknown): SessionDetail {
  const detail = raw as SessionDetail
  
  return {
    ...detail,
    movieName: detail.movieName || detail.movie?.title,
    cinemaName: detail.cinemaName || detail.cinema?.name,
    startAt: detail.startAt || detail.startTime
  }
}
