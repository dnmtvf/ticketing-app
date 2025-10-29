import { z } from 'zod'

export const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  posterImage: z.string(),  // API field name
  posterFullUrl: z.string().url().optional(), // Full image URL
  description: z.string().optional(),
  lengthMinutes: z.number(),  // API field name - this is the actual duration field
  rating: z.union([z.number(), z.string()]).optional(),
  year: z.union([z.number(), z.string()]).optional()
})

export const CinemaSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string().optional()
})

export const SessionSchema = z.object({
  id: z.number(),
  movieId: z.number(),
  cinemaId: z.number(),
  startTime: z.string()
})

export const SessionDetailSchema = z.object({
  id: z.number(),
  movieId: z.number(),
  cinemaId: z.number(),
  startTime: z.string(),
  seats: z.union([
    z.object({ rows: z.number(), cols: z.number().optional(), seatsPerRow: z.number().optional() }),
    z.array(z.array(z.unknown()))
  ]),
  bookedSeats: z.array(z.object({
    rowNumber: z.number(),
    seatNumber: z.number()
  })).default([])
})

export const BookingSchema = z.object({
  id: z.union([z.string(), z.number()]),
  movieSessionId: z.number(),
  userId: z.number(),
  isPaid: z.boolean(),
  seats: z.array(z.object({
    rowNumber: z.number(),
    seatNumber: z.number()
  })),
  bookedAt: z.string()
})

export const EnrichedBookingSchema = BookingSchema.extend({
  movieName: z.string(),
  moviePoster: z.string(),
  lengthMinutes: z.number(),
  cinemaName: z.string(),
  sessionTime: z.string()
})

export const SettingsSchema = z.object({
  bookingPaymentTimeSeconds: z.number()
})

export type Movie = z.infer<typeof MovieSchema>
export type Cinema = z.infer<typeof CinemaSchema>
export type Session = z.infer<typeof SessionSchema>
export type SessionDetail = z.infer<typeof SessionDetailSchema>
export type Booking = z.infer<typeof BookingSchema>
export type EnrichedBooking = z.infer<typeof EnrichedBookingSchema>
export type Settings = z.infer<typeof SettingsSchema>
