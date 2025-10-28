import { describe, it, expect } from 'vitest'
import { validateUsername, validatePassword } from '~/app/utils/validation'

describe('auth validation utils', () => {
  it('rejects short username', () => {
    expect(validateUsername('user')).toContain('не менее 8')
  })
  it('accepts long username', () => {
    expect(validateUsername('username')).toBe('')
  })
  it('rejects password without upper or digit', () => {
    expect(validatePassword('password')).toContain('1 заглавная')
    expect(validatePassword('PASSWORD')).toContain('1 цифра')
  })
  it('accepts strong password', () => {
    expect(validatePassword('Abcdefg1')).toBe('')
  })
})
