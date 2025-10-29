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
  const selectedSeats = ref<SeatPosition[]>([])
  const sessionDetail = ref<SessionDetail | null>(null)

  const getSeatDimensions = computed(() => {
    const seats = sessionDetail.value?.seats
    if (!seats) return { rows: 0, cols: 0 }

    if (Array.isArray(seats)) {
      const [firstRow] = seats
      return {
        rows: seats.length,
        cols: Array.isArray(firstRow) ? firstRow.length : 0
      }
    }

    return {
      rows: seats.rows,
      cols: seats.cols ?? seats.seatsPerRow ?? 0
    }
  })

  const bookedSeats = computed(() => {
    return (sessionDetail.value?.bookedSeats || []).map(seat => ({
      row: seat.rowNumber,
      col: seat.seatNumber
    }))
  })

  const isSeatBooked = (row: number, col: number): boolean => {
    return bookedSeats.value.some(seat => seat.row === row && seat.col === col)
  }

  const isSeatSelected = (row: number, col: number): boolean => {
    return selectedSeats.value.some(seat => seat.row === row && seat.col === col)
  }

  const toggleSeat = (row: number, col: number): void => {
    if (isSeatBooked(row, col)) return

    const index = selectedSeats.value.findIndex(seat => seat.row === row && seat.col === col)
    if (index >= 0) {
      selectedSeats.value.splice(index, 1)
    } else {
      selectedSeats.value.push({ row, col })
    }
  }

  const clearSelection = (): void => {
    selectedSeats.value = []
  }

  const getSelectedSeatsForApi = computed(() => {
    return selectedSeats.value.map(seat => ({
      rowNumber: seat.row,
      seatNumber: seat.col
    }))
  })

  const setSessionDetail = (detail: SessionDetail): void => {
    sessionDetail.value = detail
    clearSelection()
  }

  return {
    selectedSeats,
    sessionDetail,
    getSeatDimensions,
    bookedSeats,
    getSelectedSeatsForApi,
    isSeatBooked,
    isSeatSelected,
    toggleSeat,
    clearSelection,
    setSessionDetail
  }
}
