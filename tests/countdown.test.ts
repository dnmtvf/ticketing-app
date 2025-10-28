import { describe, it, expect } from 'vitest'
import { remainingSeconds } from '~/app/utils/time'

describe('remainingSeconds', () => {
  it('returns zero when expired', () => {
    const now = Date.now()
    const bookedAt = now - 10_000
    expect(remainingSeconds(bookedAt, 5, now)).toBe(0)
  })
  it('computes remaining from bookedAt and timeout', () => {
    const now = Date.now()
    const bookedAt = now - 5_000
    expect(remainingSeconds(bookedAt, 10, now)).toBe(5)
  })
})
