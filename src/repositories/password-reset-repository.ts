export interface PasswordResetToken {
  id: string
  token: string
  email: string
  expires: Date
  used: boolean
  created_at: Date
}

export interface PasswordResetRepository {
  create(data: {
    token: string
    email: string
    expires: Date
  }): Promise<PasswordResetToken>
  findByToken(token: string): Promise<PasswordResetToken | null>
  markAsUsed(token: string): Promise<void>
  deleteExpiredTokens(): Promise<void>
}
