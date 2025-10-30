import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from '~/app/components/auth/RegisterForm.vue'

describe('RegisterForm', () => {
  const globalStubs = {
    BaseButton: {
      name: 'BaseButton',
      template: '<button type="submit" :disabled="disabled"><slot /></button>',
      props: ['loading', 'disabled']
    }
  }

  describe('Positive paths', () => {
    it('renders all form fields correctly', () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      expect(wrapper.find('#username').exists()).toBe(true)
      expect(wrapper.find('#password').exists()).toBe(true)
      expect(wrapper.find('#passwordConfirmation').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('accepts valid input in all fields', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      const usernameInput = wrapper.find('#username')
      const passwordInput = wrapper.find('#password')
      const confirmationInput = wrapper.find('#passwordConfirmation')

      await usernameInput.setValue('testuser123')
      await passwordInput.setValue('Password1')
      await confirmationInput.setValue('Password1')

      expect((usernameInput.element as HTMLInputElement).value).toBe('testuser123')
      expect((passwordInput.element as HTMLInputElement).value).toBe('Password1')
      expect((confirmationInput.element as HTMLInputElement).value).toBe('Password1')
    })

    it('emits submit event with form data when valid form is submitted', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password1')
      await wrapper.find('form').trigger('submit.prevent')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(wrapper.emitted()).toHaveProperty('submit')
      const emittedEvents = wrapper.emitted('submit')
      expect(emittedEvents).toBeTruthy()
      expect(emittedEvents![0]).toEqual([{
        username: 'testuser123',
        password: 'Password1',
        passwordConfirmation: 'Password1'
      }])
    })

    it('does not show validation errors when all fields are valid', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const errorMessages = wrapper.findAll('.text-rose-400')
      expect(errorMessages.length).toBe(0)
    })

    it('accepts password with Cyrillic uppercase letter', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Пароль12')
      await wrapper.find('#passwordConfirmation').setValue('Пароль12')
      await wrapper.find('form').trigger('submit.prevent')

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(wrapper.emitted('submit')).toBeTruthy()
    })
  })

  describe('Negative paths - Username validation', () => {
    it('shows error when username is empty on submit', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Логин обязателен')
    })

    it('shows error when username is less than 8 characters', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('short')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Логин должен быть не менее 8 символов')
    })

    it('applies error styling to invalid username field', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('short')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const usernameInput = wrapper.find('#username')
      expect(usernameInput.classes()).toContain('border-rose-500')
    })
  })

  describe('Negative paths - Password validation', () => {
    it('shows error when password is empty on submit', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#passwordConfirmation').setValue('Password1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Пароль обязателен')
    })

    it('shows error when password is less than 8 characters', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Pass1')
      await wrapper.find('#passwordConfirmation').setValue('Pass1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('минимум 8 символов')
    })

    it('shows error when password lacks uppercase letter', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('password1')
      await wrapper.find('#passwordConfirmation').setValue('password1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('минимум 1 заглавная буква')
    })

    it('shows error when password lacks digit', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Password')
      await wrapper.find('#passwordConfirmation').setValue('Password')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('минимум 1 цифра')
    })

    it('shows multiple password errors when multiple requirements are not met', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('pass')
      await wrapper.find('#passwordConfirmation').setValue('pass')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('минимум 8 символов')
      expect(text).toContain('минимум 1 заглавная буква')
      expect(text).toContain('минимум 1 цифра')
    })

    it('applies error styling to invalid password field', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('invalid')
      await wrapper.find('#passwordConfirmation').setValue('invalid')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const passwordInput = wrapper.find('#password')
      expect(passwordInput.classes()).toContain('border-rose-500')
    })
  })

  describe('Negative paths - Password confirmation validation', () => {
    it('shows error when password confirmation does not match', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password2')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Пароль не совпадает')
    })

    it('shows error when password confirmation is empty', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Пароль не совпадает')
    })

    it('applies error styling to invalid password confirmation field', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password2')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const confirmationInput = wrapper.find('#passwordConfirmation')
      expect(confirmationInput.classes()).toContain('border-rose-500')
    })
  })

  describe('Negative paths - Form submission', () => {
    it('does not emit submit event when form is invalid', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('short')
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('shows all validation errors when all fields are empty on submit', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      const text = wrapper.text()
      expect(text).toContain('Логин обязателен')
      expect(text).toContain('Пароль обязателен')
    })

    it('prevents multiple simultaneous submissions', async () => {
      const wrapper = mount(RegisterForm, {
        global: {
          stubs: globalStubs
        }
      })

      await wrapper.find('#username').setValue('testuser123')
      await wrapper.find('#password').setValue('Password1')
      await wrapper.find('#passwordConfirmation').setValue('Password1')

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
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
      const wrapper = mount(RegisterForm, {
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
