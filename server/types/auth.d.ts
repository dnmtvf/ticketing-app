declare module '#auth-utils' {
  interface User {
    username: string
    token: string
  }

  interface UserSession {
    user?: User
  }
}

export {}
