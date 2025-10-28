import { describe, it, expect } from 'vitest'
import { seatId, normalizeBooked, toggleSeat } from '~/app/utils/seats'

describe('seat selection utils', () => {
  it('creates stable seat id', () => {
    expect(seatId(2, 5)).toBe('r2c5')
  })
  it('normalizes booked seats from objects and strings', () => {
    const set = normalizeBooked([{ row: 1, col: 1 }, 'r2c3'])
    expect(set.has('r1c1')).toBe(true)
    expect(set.has('r2c3')).toBe(true)
  })
  it('toggleSeat respects booked and toggles selection', () => {
    const booked = new Set(['r1c1'])
    const sel: string[] = []
    toggleSeat(sel, 1, 1, booked) // blocked
    expect(sel.length).toBe(0)
    toggleSeat(sel, 1, 2, booked)
    expect(sel).toEqual(['r1c2'])
    toggleSeat(sel, 1, 2, booked)
    expect(sel).toEqual([])
  })
})
