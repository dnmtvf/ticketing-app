/**
 * Composable for movie data management
 * Handles API fetching, state management, and data validation
 */
import { z } from 'zod'
import type { Movie } from '~/schemas'

export const useMovies = () => {
  const { $api } = useNuxtApp()
  
  // Reactive state
  const movies = ref<Movie[]>([])
  const pending = ref(true)
  const error = ref<string | null>(null)

  const loadMovies = async () => {
    pending.value = true
    error.value = null
    
    try {
      const { MovieSchema } = await import('~/schemas')
      const res = await $api('/movies')
      const parsed = z.array(MovieSchema).safeParse(res)
      
      if (!parsed.success) {
        error.value = 'Ошибка загрузки фильмов'
      } else {
        movies.value = parsed.data
      }
    } catch {
      error.value = 'Ошибка загрузки фильмов'
    } finally {
      pending.value = false
    }
  }

  // Auto-load movies when composable is used
  onMounted(() => {
    loadMovies()
  })

  return {
    movies: readonly(movies),
    pending: readonly(pending),
    error: readonly(error),
    loadMovies,
    refresh: loadMovies
  }
}
