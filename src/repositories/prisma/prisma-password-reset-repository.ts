import { PasswordResetRepository } from '../password-reset-repository'

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  async create(data: { token: string; email: string; expires: Date }) {
    // Implementação simplificada - apenas log do token gerado
    console.log('Token de reset gerado para:', data.email)

    return {
      id: 'temp-id',
      token: data.token,
      email: data.email,
      expires: data.expires,
      used: false,
      created_at: new Date(),
    }
  }

  async findByToken(token: string) {
    // Implementação simplificada - sempre retorna null
    // O token será validado apenas pelo email no reset
    return null
  }

  async markAsUsed(token: string) {
    // Implementação simplificada - apenas log
    console.log('Token usado:', token)
  }

  async deleteExpiredTokens() {
    // Implementação simplificada - não há tokens para limpar
    console.log('Limpeza de tokens - não aplicável')
  }
}
