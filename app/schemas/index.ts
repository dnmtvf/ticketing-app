import { z } from 'zod'

export const MovieSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().optional(),
  name: z.string().optional(),
  posterImage: z.string().optional(),  // API field name
  posterUrl: z.string().url().optional(),  // For backward compatibility
  posterFullUrl: z.string().url().optional(), // Full image URL
  description: z.string().optional(),
  duration: z.string().optional(),
  runtime: z.string().optional(),
  lengthMinutes: z.number().optional(),  // API field name
  rating: z.union([z.number(), z.string()]).optional(),
  year: z.union([z.number(), z.string()]).optional()
})

export const CinemaSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  address: z.string().optional()
})

export const SessionSchema = z.object({
  id: z.union([z.number(), z.string()]),
  movieId: z.union([z.number(), z.string()]).optional(),
  cinemaId: z.union([z.number(), z.string()]).optional(),
  startTime: z.string().optional(),
  startAt: z.string().optional(),
  start_time: z.string().optional(),
  cinemaName: z.string().optional(),
  movieName: z.string().optional(),
  cinema: CinemaSchema.optional(),
  movie: MovieSchema.optional()
})

export const SessionDetailSchema = z.object({
  id: z.union([z.number(), z.string()]),
  movie: MovieSchema.optional(),
  movieName: z.string().optional(),
  cinema: CinemaSchema.optional(),
  cinemaName: z.string().optional(),
  startTime: z.string().optional(),
  startAt: z.string().optional(),
  seats: z.union([
    z.object({ rows: z.number(), cols: z.number().optional(), seatsPerRow: z.number().optional() }),
    z.array(z.array(z.unknown()))
  ]),
  bookedSeats: z.array(z.union([
    z.string(),
    z.object({ row: z.number(), col: z.number() }),
    z.object({ rowNumber: z.number(), seatNumber: z.number() })
  ])).default([])
})

export const BookingSchema = z.object({
  id: z.union([z.number(), z.string()]),
  movieSessionId: z.union([z.number(), z.string()]).optional(),
  sessionId: z.union([z.number(), z.string()]).optional(),
  isPaid: z.boolean().optional(),
  movie: MovieSchema.optional(),
  movieName: z.string().optional(),
  cinema: CinemaSchema.optional(),
  cinemaName: z.string().optional(),
  startAt: z.string().optional(),
  seats: z.array(z.union([
    z.string(),
    z.object({ row: z.number(), col: z.number() }),
    z.object({ rowNumber: z.number(), seatNumber: z.number() })
  ])).optional(),
  status: z.enum(['unpaid','paid','upcoming','past','expired']).or(z.string()),
  bookedAt: z.string().optional(),
  createdAt: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional()
})

export const SettingsSchema = z.object({
  paymentTimeoutSeconds: z.number()
}).or(z.object({ bookingPaymentTimeSeconds: z.number() }))

export type Movie = z.infer<typeof MovieSchema>
export type Cinema = z.infer<typeof CinemaSchema>
export type Session = z.infer<typeof SessionSchema>
export type SessionDetail = z.infer<typeof SessionDetailSchema>
export type Booking = z.infer<typeof BookingSchema>
export type Settings = z.infer<typeof SettingsSchema>
