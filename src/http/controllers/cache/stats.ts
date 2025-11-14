import { FastifyReply, FastifyRequest } from 'fastify'
import { cache } from '@/lib/cache'
import { invalidateCache, invalidateCacheByKey } from '@/http/middlewares/cache'

export async function getCacheStats(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const stats = cache.getStats()

  // Feature flags atuais
  const featureFlags = {
    ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',
    ENABLE_CACHE_CATEGORIES: process.env.ENABLE_CACHE_CATEGORIES === 'true',
    ENABLE_CACHE_BANKS: process.env.ENABLE_CACHE_BANKS === 'true',
    ENABLE_CACHE_COMPANIES: process.env.ENABLE_CACHE_COMPANIES === 'true',
    ENABLE_CACHE_ORGANIZATIONS:
      process.env.ENABLE_CACHE_ORGANIZATIONS === 'true',
    ENABLE_CACHE_EXPENSES: process.env.ENABLE_CACHE_EXPENSES === 'true',
    ENABLE_CACHE_GAINS: process.env.ENABLE_CACHE_GAINS === 'true',
    ENABLE_CACHE_CREDITS: process.env.ENABLE_CACHE_CREDITS === 'true',
    ENABLE_CACHE_RESULTS: process.env.ENABLE_CACHE_RESULTS === 'true',
    ENABLE_CACHE_FINANCIAL_PROJECTION:
      process.env.ENABLE_CACHE_FINANCIAL_PROJECTION === 'true',
    ENABLE_CACHE_TRANSACTIONS: process.env.ENABLE_CACHE_TRANSACTIONS === 'true',
  }

  return reply.status(200).send({
    cache: stats,
    featureFlags,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  })
}

export async function clearCache(request: FastifyRequest, reply: FastifyReply) {
  cache.clear()

  return reply.status(200).send({
    message: 'Cache limpo com sucesso',
    timestamp: new Date().toISOString(),
  })
}

export async function configureCache(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { ttl, maxSize, enabled } = request.body as {
    ttl?: number
    maxSize?: number
    enabled?: boolean
  }

  cache.configure({
    ttl,
    maxSize,
    enabled,
  })

  return reply.status(200).send({
    message: 'Configuração do cache atualizada',
    config: { ttl, maxSize, enabled },
    timestamp: new Date().toISOString(),
  })
}

export async function invalidateCacheEndpoint(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { pattern, key } = request.body as {
    pattern?: string
    key?: string
  }

  if (pattern) {
    invalidateCache(pattern)
    return reply.status(200).send({
      message: `Cache invalidated for pattern: ${pattern}`,
      timestamp: new Date().toISOString(),
    })
  }

  if (key) {
    invalidateCacheByKey(key)
    return reply.status(200).send({
      message: `Cache invalidated for key: ${key}`,
      timestamp: new Date().toISOString(),
    })
  }

  return reply.status(400).send({
    message: 'Either pattern or key must be provided',
    timestamp: new Date().toISOString(),
  })
}

export async function getCacheKeys(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const keys = cache.getKeys()

  return reply.status(200).send({
    keys,
    count: keys.length,
    timestamp: new Date().toISOString(),
  })
}
