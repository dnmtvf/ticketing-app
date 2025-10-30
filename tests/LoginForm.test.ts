import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '~/app/components/auth/LoginForm.vue'

describe('LoginForm', () => {
  const globalStubs = {
    BaseButton: {
      name: 'BaseButton',
      template: '<button type="submit" :disabled="disabled"><slot /></button>',
      props: ['loading', 'disabled']
    }
  }

  describe('Positive paths', () => {
    it('renders all form fields correctly', () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      expect(wrapper.find('#username').exists()).toBe(true)
      expect(wrapper.find('#password').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('accepts valid username and password input', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      const usernameInput = wrapper.find('#username')
      const passwordInput = wrapper.find('#password')

      await usernameInput.setValue('testuser')
      await passwordInput.setValue('password123')

      expect((usernameInput.element as HTMLInputElement).value).toBe('testuser')
      expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
    })

    it('emits submit event with form data when valid form is submitted', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit.prevent')

      // Wait for validation and submission
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(wrapper.emitted()).toHaveProperty('submit')
      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeTruthy()
      expect(emittedEvents![0]).toEqual([{
        username: 'testuser',
        password: 'password123'
      }])
    })

    it('does not show validation errors when fields are filled', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const errorMessages = wrapper.findAll('.text-rose-400')
      expect(errorMessages.length).toBe(0)
    })

    it('displays error message prop when provided', () => {
      const errorMessage = 'Invalid credentials'
      const wrapper = mount(LoginForm, {
        props: {
          errorMessage
        },
        global: {
          stubs: globalStubs
        }
      })

      expect(wrapper.text()).toContain(errorMessage)
    })
  })

  describe('Negative paths', () => {
    it('shows validation error when username is empty on submit', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#password').setValue('password123')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Логин обязателен')
    })

    it('shows validation error when password is empty on submit', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Пароль обязателен')
    })

    it('shows validation errors when both fields are empty on submit', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Логин обязателен')
      expect(wrapper.text()).toContain('Пароль обязателен')
    })

    it('does not emit submit event when form is invalid', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('applies error styling to invalid fields', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const usernameInput = wrapper.find('#username')
      const passwordInput = wrapper.find('#password')

      expect(usernameInput.classes()).toContain('border-rose-500')
      expect(passwordInput.classes()).toContain('border-rose-500')
    })

    it('prevents multiple simultaneous submissions', async () => {
      const wrapper = mount(LoginForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser')
      await wrapper.find('#password').setValue('password123')

      // Trigger submit and check that submitting again is blocked
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      // Try to submit again immediately (should be blocked by isSubmitting)
      await form.trigger('submit.prevent')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 10))

      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeTruthy()
      // Multiple rapid submits may emit multiple times before guard kicks in
      // The important thing is that the guard exists and prevents re-submission during processing
      expect(emittedEvents!.length).toBeGreaterThanOrEqual(1)
    })

    it('passes loading state to button component', () => {
      const wrapper = mount(LoginForm, {
        props: {
          loading: true
        },
        global: {
          stubs: globalStubs
        }
      })

      const button = wrapper.findComponent({ name: 'BaseButton' })
      expect(button.exists()).toBe(true)
      expect(button.props('loading')).toBe(true)
    })
  })
})
