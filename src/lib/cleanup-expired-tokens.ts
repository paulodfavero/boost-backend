export class TokenCleanupService {
  async cleanupExpiredTokens() {
    // Não há tokens para limpar na implementação simplificada
    // console.log('Serviço de limpeza - não aplicável na implementação atual')
  }

  // Executar limpeza a cada hora
  startCleanupSchedule() {
    setInterval(() => {
      this.cleanupExpiredTokens()
    }, 60 * 60 * 1000) // 1 hora em millisegundos
  }
}
