import { FastifyRequest, FastifyReply } from 'fastify'
import { cache } from '@/lib/cache'

// Feature flags para controle granular do cache
const CACHE_FEATURE_FLAGS = {
  // Cache global
  ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',

  // Cache por endpoint
  ENABLE_CACHE_CATEGORIES: process.env.ENABLE_CACHE_CATEGORIES === 'true',
  ENABLE_CACHE_BANKS: process.env.ENABLE_CACHE_BANKS === 'true',
  ENABLE_CACHE_COMPANIES: process.env.ENABLE_CACHE_COMPANIES === 'true',
  ENABLE_CACHE_ORGANIZATIONS: process.env.ENABLE_CACHE_ORGANIZATIONS === 'true',
  ENABLE_CACHE_EXPENSES: process.env.ENABLE_CACHE_EXPENSES === 'true',
  ENABLE_CACHE_GAINS: process.env.ENABLE_CACHE_GAINS === 'true',
  ENABLE_CACHE_CREDITS: process.env.ENABLE_CACHE_CREDITS === 'true',
  ENABLE_CACHE_RESULTS: process.env.ENABLE_CACHE_RESULTS === 'true',
  ENABLE_CACHE_SUBCATEGORIES: process.env.ENABLE_CACHE_SUBCATEGORIES === 'true',

  // Cache de transações (mais crítico)
  ENABLE_CACHE_TRANSACTIONS: process.env.ENABLE_CACHE_TRANSACTIONS === 'true',
}

// Função para verificar se cache está habilitado para um endpoint específico
function isCacheEnabledForEndpoint(
  endpoint: keyof typeof CACHE_FEATURE_FLAGS,
): boolean {
  return CACHE_FEATURE_FLAGS.ENABLE_CACHE && CACHE_FEATURE_FLAGS[endpoint]
}

interface CacheOptions {
  ttl?: number // Time to live em millisegundos
  keyGenerator?: (request: FastifyRequest) => string
  skipCache?: (request: FastifyRequest) => boolean
  enabled?: boolean // Se o cache está habilitado para este endpoint
}

// Gerador de chave padrão baseado na URL e query params
function defaultKeyGenerator(request: FastifyRequest): string {
  const url = request.url
  const method = request.method
  const query = request.query ? JSON.stringify(request.query) : ''
  const params = request.params ? JSON.stringify(request.params) : ''

  return `${method}:${url}:${query}:${params}`
}

// Middleware de cache para requisições GET
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false,
    enabled = true,
  } = options

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Verificar se cache global está habilitado
    if (!CACHE_FEATURE_FLAGS.ENABLE_CACHE) {
      reply.header('X-Cache-Enabled', 'false')
      return
    }

    // Verificar se cache está habilitado para este endpoint específico
    if (!enabled) {
      reply.header('X-Cache-Enabled', 'false')
      return
    }

    // Só aplicar cache em requisições GET
    if (request.method !== 'GET') {
      return
    }

    // Verificar se deve pular o cache
    if (skipCache(request)) {
      return
    }

    const cacheKey = keyGenerator(request)

    // Tentar buscar no cache
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      // Adicionar headers de cache
      reply.header('X-Cache', 'HIT')
      reply.header('X-Cache-Key', cacheKey)
      reply.header('X-Cache-Enabled', 'true')

      return reply.send(cachedData)
    }

    // Se não encontrou no cache, adicionar header para indicar miss
    reply.header('X-Cache', 'MISS')
    reply.header('X-Cache-Key', cacheKey)
    reply.header('X-Cache-Enabled', 'true')
  }
}

// Função para salvar resposta no cache
export function saveToCache(
  request: FastifyRequest,
  data: any,
  options: CacheOptions = {},
) {
  // Verificar se cache global está habilitado
  if (!CACHE_FEATURE_FLAGS.ENABLE_CACHE) {
    return
  }

  const {
    ttl = 5 * 60 * 1000,
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false,
    enabled = true,
  } = options

  // Verificar se cache está habilitado para este endpoint específico
  if (!enabled) {
    return
  }

  // Só salvar se for GET e não deve pular cache
  if (request.method === 'GET' && !skipCache(request)) {
    const cacheKey = keyGenerator(request)
    cache.set(cacheKey, data, ttl)
  }
}

// Função para invalidar cache por padrão
export function invalidateCache(pattern: string) {
  // Implementação granular - invalida apenas chaves que correspondem ao padrão
  const keysToDelete: string[] = []

  for (const key of cache.getKeys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach((key) => cache.delete(key))

  // Log mais detalhado para produção
  if (keysToDelete.length > 0) {
    console.log(
      `🗑️ Cache invalidated: ${keysToDelete.length} keys matching pattern "${pattern}"`,
    )
    console.log(`Keys: ${keysToDelete.join(', ')}`)
  }
}

// Função para invalidar cache específico
export function invalidateCacheByKey(key: string) {
  cache.delete(key)
}

// Função para invalidar múltiplas chaves
export function invalidateMultipleKeys(keys: string[]) {
  keys.forEach((key) => cache.delete(key))
}

// Função para invalidar cache relacionado (quando uma operação afeta múltiplos tipos)
export function invalidateRelatedCache(patterns: string[]) {
  patterns.forEach((pattern) => invalidateCache(pattern))
}

// Função para invalidar cache de transações (afeta expenses, gains, credits e results)
export function invalidateTransactionCache() {
  invalidateRelatedCache(['expenses', 'gains', 'credits', 'results'])
}

// Middleware para endpoints específicos com configurações customizadas
export const cacheConfigs = {
  // Cache para categorias - 10 minutos
  categories: {
    ttl: 15 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_CATEGORIES'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as { a?: string }
      return `categories:${query.a || 'all'}`
    },
  },

  // Cache para bancos - 15 minutos
  banks: {
    ttl: 15 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_BANKS'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as { a?: string }
      return `banks:${query.a || 'all'}`
    },
  },

  // Cache para empresas - 5 minutos
  companies: {
    ttl: 5 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_COMPANIES'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as { a?: string }
      return `companies:${query.a || 'all'}`
    },
  },

  // Cache para organizações - 2 minutos (dados mais dinâmicos)
  organizations: {
    ttl: 2 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_ORGANIZATIONS'),
    keyGenerator: (request: FastifyRequest) => {
      const params = request.params as { id?: string }
      return `organization:${params.id}`
    },
  },

  // Cache para despesas - 3 minutos (dados semi-dinâmicos)
  expenses: {
    ttl: 5 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_EXPENSES'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as {
        a?: string
        date?: string
        bankId?: string
        isSamePersonTransfer?: string
      }
      return `expenses:${query.a}:${query.date}:${query.bankId || 'all'}:${
        query.isSamePersonTransfer || 'false'
      }`
    },
  },

  // Cache para ganhos - 3 minutos (dados semi-dinâmicos)
  gains: {
    ttl: 5 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_GAINS'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as {
        a?: string
        date?: string
        bankId?: string
        isSamePersonTransfer?: string
      }
      return `gains:${query.a}:${query.date}:${query.bankId || 'all'}:${
        query.isSamePersonTransfer || 'false'
      }`
    },
  },

  // Cache para créditos - 5 minutos
  credits: {
    ttl: 5 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_CREDITS'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as {
        a?: string
        date?: string
        bankId?: string
        isSamePersonTransfer?: string
      }
      return `credits:${query.a || 'all'}:${query.date || 'all'}:${
        query.bankId || 'all'
      }:${query.isSamePersonTransfer || 'false'}`
    },
  },

  results: {
    ttl: 5 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_RESULTS'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as {
        a?: string
        date?: string
        bankId?: string
        isSamePersonTransfer?: string
      }
      return `results:${query.a || 'all'}:${query.date || 'all'}:${
        query.bankId || 'all'
      }:${query.isSamePersonTransfer || 'false'}`
    },
  },

  // Cache para subcategorias - 15 minutos (dados relativamente estáticos)
  subcategories: {
    ttl: 15 * 60 * 1000,
    enabled: isCacheEnabledForEndpoint('ENABLE_CACHE_SUBCATEGORIES'),
    keyGenerator: (request: FastifyRequest) => {
      const query = request.query as { a?: string }
      return `subcategories:${query.a || 'all'}`
    },
  },
}
