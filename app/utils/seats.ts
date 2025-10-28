export const seatId = (r: number, c: number) => `r${r}c${c}`

type BookedSeatRC = { row: number; col: number }
type BookedSeatRN = { rowNumber: number; seatNumber: number }
type BookedSeat = string | BookedSeatRC | BookedSeatRN

export function normalizeBooked(booked: BookedSeat[]): Set<string> {
  const set = new Set<string>()
  for (const b of booked) {
    if (typeof b === 'string') {
      set.add(b)
      continue
    }
    if (b && typeof b === 'object') {
      if ('row' in b && 'col' in b && typeof b.row === 'number' && typeof b.col === 'number') {
        set.add(seatId(b.row, b.col))
        continue
      }
      if ('rowNumber' in b && 'seatNumber' in b && typeof b.rowNumber === 'number' && typeof b.seatNumber === 'number') {
        set.add(seatId(b.rowNumber, b.seatNumber))
      }
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
