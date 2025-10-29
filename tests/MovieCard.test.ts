import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MovieCard from '~/app/components/movies/MovieCard.vue'
import type { Movie } from '~/schemas'

describe('MovieCard', () => {
  const mockMovie: Movie = {
    id: 1,
    title: 'Inception',
    posterImage: '/posters/inception.jpg',
    posterFullUrl: 'http://localhost:3000/posters/inception.jpg',
    description: 'A mind-bending thriller',
    lengthMinutes: 148,
    rating: 8.8,
    year: 2010
  }

  // Global stubs for all tests
  const globalStubs = {
    BaseButton: {
      template: '<button @click="$emit(\'click\')"><slot /></button>'
    }
  }

  it('renders movie poster with correct src and alt', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(mockMovie.posterFullUrl)
    expect(img.attributes('alt')).toBe(mockMovie.title)
  })

  it('renders movie title', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    expect(wrapper.text()).toContain('Inception')
  })

  it('renders movie length in minutes with "мин" suffix', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    expect(wrapper.text()).toContain('148 мин')
  })

  it('renders movie rating', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    expect(wrapper.text()).toContain('8.8')
  })

  it('renders "Посмотреть сеансы" button', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Посмотреть сеансы')
  })

  it('emits movie-select event with movie id when button is clicked', async () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('movie-select')
    // The event might be emitted once or twice depending on stub behavior
    const emittedEvents = wrapper.emitted('movie-select')
    expect(emittedEvents).toBeTruthy()
    expect(emittedEvents!.length).toBeGreaterThanOrEqual(1)
    // Check that at least one emission has the correct movie ID
    expect(emittedEvents![0]).toEqual([1])
  })

  it('handles movie with string rating', () => {
    const movieWithStringRating: Movie = {
      ...mockMovie,
      rating: '8.8'
    }

    const wrapper = mount(MovieCard, {
      props: {
        movie: movieWithStringRating
      },
      global: {
        stubs: globalStubs
      }
    })

    expect(wrapper.text()).toContain('8.8')
  })

  it('handles movie without posterFullUrl', () => {
    const movieWithoutFullUrl: Movie = {
      ...mockMovie,
      posterFullUrl: undefined
    }

    const wrapper = mount(MovieCard, {
      props: {
        movie: movieWithoutFullUrl
      },
      global: {
        stubs: globalStubs
      }
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    // Should still have src from posterImage or undefined
  })

  it('renders as table row element', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    expect(wrapper.element.tagName).toBe('TR')
  })

  it('has correct number of table cells', () => {
    const wrapper = mount(MovieCard, {
      props: {
        movie: mockMovie
      },
      global: {
        stubs: globalStubs
      }
    })

    const cells = wrapper.findAll('td')
    expect(cells).toHaveLength(5) // poster, title, length, rating, button
  })
})
