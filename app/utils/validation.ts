export function validateUsername(username: string): string {
  if (username && username.length < 8) return 'Логин должен быть не менее 8 символов'
  return ''
}

export function validatePassword(pass: string): string {
  if (!pass) return ''
  const hasUpper = /[A-ZА-Я]/.test(pass)
  const hasDigit = /\d/.test(pass)
  if (pass.length < 8 || !hasUpper || !hasDigit) {
    return 'Пароль: минимум 8 символов, минимум 1 заглавная буква и 1 цифра'
  }
  return ''
}
