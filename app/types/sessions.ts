import type { SessionDetail, Session, Movie } from '~/schemas'

/**
 * Session data enriched with movie and cinema names
 * Created by fetching movie/cinema data separately and combining with session data
 */
export type EnrichedSession = SessionDetail & {
  movieName: string
  cinemaName: string
}

/**
 * Session with full movie data for displaying cinema sessions grouped by movie
 */
export type SessionWithMovie = Session & {
  movie: Movie
}
