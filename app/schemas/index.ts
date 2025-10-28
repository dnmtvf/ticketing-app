import { z } from 'zod'

export const MovieSchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().optional(),
  name: z.string().optional(),
  posterUrl: z.string().url().optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
  runtime: z.string().optional(),
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
  startAt: z.string().optional(),
  seats: z.union([
    z.object({ rows: z.number(), cols: z.number() }),
    z.array(z.array(z.any()))
  ]),
  bookedSeats: z.array(z.union([z.string(), z.object({ row: z.number(), col: z.number() })])).default([])
})

export const BookingSchema = z.object({
  id: z.union([z.number(), z.string()]),
  sessionId: z.union([z.number(), z.string()]).optional(),
  movie: MovieSchema.optional(),
  movieName: z.string().optional(),
  cinema: CinemaSchema.optional(),
  cinemaName: z.string().optional(),
  startAt: z.string().optional(),
  seats: z.array(z.union([z.string(), z.object({ row: z.number(), col: z.number() })])).optional(),
  status: z.enum(['unpaid','paid','upcoming','past','expired']).or(z.string()),
  bookedAt: z.string().optional(),
  createdAt: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional()
})

export const SettingsSchema = z.object({
  paymentTimeoutSeconds: z.number()
})
