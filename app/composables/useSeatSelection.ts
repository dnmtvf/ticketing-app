/**
 * Composable for seat selection logic
 * Handles seat state management and selection operations
 */
import type { SessionDetail } from '~/schemas'

type SeatPosition = {
  row: number
  col: number
}

export const useSeatSelection = () => {
  const selectedSeats = ref<string[]>([])
  const sessionDetail = ref<SessionDetail | null>(null)

  const generateSeatId = (row: number, col: number): string => `r${row}c${col}`

  const parseSeatId = (seatId: string): SeatPosition => {
    const [rowStr, colStr] = seatId.slice(1).split('c')
    return {
      row: parseInt(rowStr, 10),
      col: parseInt(colStr, 10)
    }
  }

  // Get seat dimensions from session detail
  const getSeatDimensions = computed(() => {
    if (!sessionDetail.value?.seats) {
      return { rows: 0, cols: 0 }
    }

    const seats = sessionDetail.value.seats
    if (Array.isArray(seats)) {
      const rows = seats.length
      const cols = Array.isArray(seats[0]) ? seats[0].length : 0
      return { rows, cols }
    }

    if (typeof seats === 'object' && seats !== null) {
      const { rows, cols, seatsPerRow } = seats as { rows: number; cols?: number; seatsPerRow?: number }
      return { 
        rows, 
        cols: cols || seatsPerRow || 0 
      }
    }

    return { rows: 0, cols: 0 }
  })

  const getBookedSeatsSet = computed(() => {
    const bookedSeats = sessionDetail.value?.bookedSeats || []
    const bookedSet = new Set<string>()

    for (const seat of bookedSeats) {
      if (typeof seat === 'string') {
        bookedSet.add(seat)
        continue
      }

      if (typeof seat === 'object' && seat !== null) {
        if ('row' in seat && 'col' in seat && typeof seat.row === 'number' && typeof seat.col === 'number') {
          bookedSet.add(generateSeatId(seat.row, seat.col))
          continue
        }
        if ('rowNumber' in seat && 'seatNumber' in seat && 
            typeof seat.rowNumber === 'number' && typeof seat.seatNumber === 'number') {
          bookedSet.add(generateSeatId(seat.rowNumber, seat.seatNumber))
        }
      }
    }

    return bookedSet
  })

  const isSeatBooked = (row: number, col: number): boolean => {
    const seatId = generateSeatId(row, col)
    return getBookedSeatsSet.value.has(seatId)
  }

  // Check if a seat is selected
  const isSeatSelected = (row: number, col: number): boolean => {
    const seatId = generateSeatId(row, col)
    return selectedSeats.value.includes(seatId)
  }

  // Toggle seat selection
  const toggleSeat = (row: number, col: number): void => {
    const seatId = generateSeatId(row, col)
    
    // Can't select booked seats
    if (isSeatBooked(row, col)) return

    const index = selectedSeats.value.indexOf(seatId)
    if (index >= 0) {
      selectedSeats.value.splice(index, 1)
    } else {
      selectedSeats.value.push(seatId)
    }
  }

  // Clear all selections
  const clearSelection = (): void => {
    selectedSeats.value = []
  }

  // Get selected seats in API format
  const getSelectedSeatsForApi = computed(() => {
    return selectedSeats.value.map(seatId => {
      const { row, col } = parseSeatId(seatId)
      return { rowNumber: row, seatNumber: col }
    })
  })

  // Set session detail and clear previous selection
  const setSessionDetail = (detail: SessionDetail): void => {
    sessionDetail.value = detail
    clearSelection()
  }

  return {
    // State
    selectedSeats,
    sessionDetail,
    
    // Computed
    getSeatDimensions,
    getBookedSeatsSet,
    getSelectedSeatsForApi,
    
    // Actions
    generateSeatId,
    parseSeatId,
    isSeatBooked,
    isSeatSelected,
    toggleSeat,
    clearSelection,
    setSessionDetail
  }
}
