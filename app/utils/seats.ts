export const seatId = (r: number, c: number) => `r${r}c${c}`

export function normalizeBooked(booked: any): Set<string> {
  const set = new Set<string>()
  if (Array.isArray(booked)) {
    for (const b of booked) {
      if (typeof b === 'string') set.add(b)
      else if (b && typeof b === 'object' && 'row' in b && 'col' in b) set.add(seatId(b.row, b.col))
    }
  }
  return set
}

export function toggleSeat(selected: string[], r: number, c: number, booked: Set<string>) {
  const id = seatId(r, c)
  if (booked.has(id)) return selected
  const idx = selected.indexOf(id)
  if (idx >= 0) selected.splice(idx, 1)
  else selected.push(id)
  return selected
}
