import type { SessionDetail } from '~/schemas'

/**
 * Session data enriched with movie and cinema names
 * Created by fetching movie/cinema data separately and combining with session data
 */
export type EnrichedSession = SessionDetail & {
  movieName: string
  cinemaName: string
}
