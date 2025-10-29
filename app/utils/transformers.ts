import groupBy from 'lodash-es/groupBy'
import sortBy from 'lodash-es/sortBy'
import type { Movie, Session } from '~/schemas'

export function normalizeMovie({ movie, apiBase }: { movie: Movie; apiBase: string }): Movie {
  const posterFullUrl = new URL(movie.posterImage, apiBase).toString()

  return {
    ...movie,
    posterFullUrl
  }
}

const getSessionDateKey = (session: Session): string => {
  const parsed = new Date(session.startTime)
  if (!Number.isNaN(parsed.getTime())) {
    const day = parsed.getDate().toString().padStart(2, '0')
    const month = (parsed.getMonth() + 1).toString().padStart(2, '0')
    return `${day}.${month}`
  }
  return session.startTime
}

export function groupSessionsByDate<T extends Session>(sessions: T[]): {
  grouped: Record<string, T[]>
  dates: string[]
} {
  const grouped = groupBy(sessions, session => getSessionDateKey(session))
  const dates = sortBy(Object.keys(grouped), key => {
    const group = grouped[key] || []
    const [record] = group
    if (record) {
      return new Date(record.startTime).getTime()
    }
    return 0
  })
  return { grouped, dates }
}


