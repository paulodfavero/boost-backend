import { app } from './app'
import { env } from './env'
import { TokenCleanupService } from './lib/cleanup-expired-tokens'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    console.log('🚀 HTTP Server Running!')

    // Iniciar serviço de limpeza de tokens expirados
    const tokenCleanupService = new TokenCleanupService()
    tokenCleanupService.startCleanupSchedule()
    console.log('🧹 Token cleanup service started!')
  })
