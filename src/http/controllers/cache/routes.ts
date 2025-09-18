import { FastifyInstance } from 'fastify'
import {
  getCacheStats,
  clearCache,
  configureCache,
  invalidateCacheEndpoint,
  getCacheKeys,
} from './stats'

export async function cacheRoutes(app: FastifyInstance) {
  // Endpoint para obter estatísticas do cache
  app.get('/cache/stats', getCacheStats)

  // Endpoint para obter chaves do cache
  app.get('/cache/keys', getCacheKeys)

  // Endpoint para limpar o cache
  app.delete('/cache', clearCache)

  // Endpoint para configurar o cache
  app.put('/cache/config', configureCache)

  // Endpoint para invalidar cache por padrão ou chave específica
  app.post('/cache/invalidate', invalidateCacheEndpoint)
}
