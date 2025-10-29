import type { Cinema, Session } from '~/schemas'

export type SessionWithCinema = Session & {
  cinema: Cinema
}
