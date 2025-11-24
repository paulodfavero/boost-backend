import { FastifyRequest, FastifyReply } from 'fastify'
import { cache } from '@/lib/cache'

// Feature flags para controle granular do cache
const CACHE_FEATURE_FLAGS = {
  // Cache global
  ENABLE_CACHE: process.env.ENABLE_CACHE === 'true',

  // Cache por endpoint - expenses, gains, credits, results, categories e subcategories
  ENABLE_CACHE_EXPENSES: process.env.ENABLE_CACHE_EXPENSES === 'true',
  ENABLE_CACHE_GAINS: process.env.ENABLE_CACHE_GAINS === 'true',
  ENABLE_CACHE_CREDITS: process.env.ENABLE_CACHE_CREDITS === 'true',
  ENABLE_CACHE_RESULTS: process.env.ENABLE_CACHE_RESULTS === 'true',
  ENABLE_CACHE_CATEGORIES: process.env.ENABLE_CACHE_CATEGORIES === 'true',
  ENABLE_CACHE_SUBCATEGORIES: process.env.ENABLE_CACHE_SUBCATEGORIES === 'true',
  ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS:
    process.env.ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS === 'true',
}

// Função para verificar se cache está habilitado para um endpoint específico
function isCacheEnabledForEndpoint(
  endpoint:
    | 'ENABLE_CACHE_EXPENSES'
    | 'ENABLE_CACHE_GAINS'
    | 'ENABLE_CACHE_CREDITS'
    | 'ENABLE_CACHE_RESULTS'
    | 'ENABLE_CACHE_CATEGORIES'
    | 'ENABLE_CACHE_SUBCATEGORIES'
    | 'ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS',
): boolean {
  return CACHE_FEATURE_FLAGS.ENABLE_CACHE && CACHE_FEATURE_FLAGS[endpoint]
}

interface CacheOptions {
  ttl?: number // Time to live em millisegundos
  keyGenerator?: (request: FastifyRequest) => string
  skipCache?: (request: FastifyRequest) => boolean
  endpointFlag?:
    | 'ENABLE_CACHE_EXPENSES'
    | 'ENABLE_CACHE_GAINS'
    | 'ENABLE_CACHE_CREDITS'
    | 'ENABLE_CACHE_RESULTS'
    | 'ENABLE_CACHE_CATEGORIES'
    | 'ENABLE_CACHE_SUBCATEGORIES'
    | 'ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS'
}

// Tipos de recursos que podem ter cache
type CacheableResource =
  | 'expenses'
  | 'gains'
  | 'credits'
  | 'results'
  | 'categories'
  | 'subcategories'
  | 'financial-projection-month-details'

// Função para converter nome do recurso para o formato do flag
function resourceToFlag(resource: CacheableResource): string {
  // Caso especial: financial-projection-month-details usa underscores no flag
  if (resource === 'financial-projection-month-details') {
    return 'ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS'
  }
  // Para outros recursos, apenas converte para uppercase
  return `ENABLE_CACHE_${resource.toUpperCase().replace(/-/g, '_')}`
}

// Gerador de chave para diferentes recursos
function generateCacheKey(
  resource: CacheableResource,
  request: FastifyRequest,
): string {
  // Para expenses, gains, credits e results
  if (['expenses', 'gains', 'credits', 'results'].includes(resource)) {
    const query = request.query as {
      a?: string
      date?: string
      bankId?: string
      isSamePersonTransfer?: string
    }

    const orgId = query.a || ''
    const date = query.date || ''
    const bankId = query.bankId || 'all'
    const isSamePersonTransfer = query.isSamePersonTransfer || 'false'

    return `${resource}:${orgId}:${date}:${bankId}:${isSamePersonTransfer}`
  }

  // Para categories
  if (resource === 'categories') {
    const query = request.query as {
      organizationId?: string
      query?: string
    }

    const organizationId = query.organizationId || ''
    const searchQuery = query.query || ''

    return `${resource}:${organizationId}:${searchQuery}`
  }

  // Para subcategories (não tem parâmetros)
  if (resource === 'subcategories') {
    return `${resource}:all`
  }

  // Para financial-projection-month-details
  if (resource === 'financial-projection-month-details') {
    const query = request.query as {
      organizationId?: string
      month?: string
    }

    const organizationId = query.organizationId || ''
    const month = query.month || ''

    return `${resource}:${organizationId}:${month}`
  }

  // Fallback
  return `${resource}:${JSON.stringify(request.query)}`
}

// Middleware de cache para requisições GET de expenses, gains e credits
export function cacheMiddleware(
  resource: CacheableResource,
  options: CacheOptions = {},
) {
  const { skipCache = () => false, endpointFlag } = options

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Verificar se cache global está habilitado
    if (process.env.ENABLE_CACHE !== 'true') {
      reply.header('X-Cache-Enabled', 'false')
      return
    }

    // Verificar se cache está habilitado para este recurso específico
    const flag =
      endpointFlag ||
      (resourceToFlag(resource) as
        | 'ENABLE_CACHE_EXPENSES'
        | 'ENABLE_CACHE_GAINS'
        | 'ENABLE_CACHE_CREDITS'
        | 'ENABLE_CACHE_RESULTS'
        | 'ENABLE_CACHE_CATEGORIES'
        | 'ENABLE_CACHE_SUBCATEGORIES'
        | 'ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS')
    if (!isCacheEnabledForEndpoint(flag)) {
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

    const cacheKey = generateCacheKey(resource, request)

    // Tentar buscar no cache
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
      // Adicionar headers de cache
      reply.header('X-Cache', 'HIT')
      reply.header('X-Cache-Key', cacheKey)
      reply.header('X-Cache-Enabled', 'true')
      reply.header('Cache-Control', 'no-cache, must-revalidate')

      return reply.send(cachedData)
    }

    // Se não encontrou no cache, adicionar header para indicar miss
    reply.header('X-Cache', 'MISS')
    reply.header('X-Cache-Key', cacheKey)
    reply.header('X-Cache-Enabled', 'true')
    reply.header('Cache-Control', 'no-cache, must-revalidate')
  }
}

// Função para salvar resposta no cache (apenas para GET de expenses, gains e credits)
export function saveToCache(
  resource: CacheableResource,
  request: FastifyRequest,
  data: any,
  options: CacheOptions = {},
) {
  // Verificar se cache global está habilitado
  if (process.env.ENABLE_CACHE !== 'true') {
    return
  }

  const { ttl = 5 * 60 * 1000, skipCache = () => false, endpointFlag } = options

  // Verificar se cache está habilitado para este recurso específico
  const flag =
    endpointFlag ||
    (resourceToFlag(resource) as
      | 'ENABLE_CACHE_EXPENSES'
      | 'ENABLE_CACHE_GAINS'
      | 'ENABLE_CACHE_CREDITS'
      | 'ENABLE_CACHE_RESULTS'
      | 'ENABLE_CACHE_CATEGORIES'
      | 'ENABLE_CACHE_SUBCATEGORIES'
      | 'ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS')
  if (!isCacheEnabledForEndpoint(flag)) {
    return
  }

  // Só salvar se for GET e não deve pular cache
  if (request.method === 'GET' && !skipCache(request)) {
    const cacheKey = generateCacheKey(resource, request)
    cache.set(cacheKey, data, ttl)
  }
}

// Função para invalidar cache de um recurso específico
// Aceita qualquer string, mas só invalida cache de expenses, gains ou credits
export function invalidateCache(resource: string) {
  // Só invalidar cache de expenses, gains, credits, results, categories, subcategories e financial-projection-month-details
  const cacheableResources: CacheableResource[] = [
    'expenses',
    'gains',
    'credits',
    'results',
    'categories',
    'subcategories',
    'financial-projection-month-details',
  ]

  if (!cacheableResources.includes(resource as CacheableResource)) {
    // Se não for um recurso cacheável, não fazer nada (mantém compatibilidade com código antigo)
    return
  }

  const allKeys = cache.getKeys()
  const keysToDelete: string[] = []

  // Buscar todas as chaves que começam com o padrão do recurso
  // Ex: "expenses:", "gains:", "credits:"
  const prefix = `${resource}:`

  for (const key of allKeys) {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key)
    }
  }

  // Remover duplicatas e deletar
  const uniqueKeysToDelete = Array.from(new Set(keysToDelete))
  uniqueKeysToDelete.forEach((key) => cache.delete(key))

  // Log para debug
  if (uniqueKeysToDelete.length > 0) {
    console.log(
      `🗑️ Cache invalidated: ${uniqueKeysToDelete.length} keys for "${resource}"`,
    )
  }
}

// Função para invalidar cache por chave específica
export function invalidateCacheByKey(key: string) {
  cache.delete(key)
  console.log(`🗑️ Cache invalidated for key: "${key}"`)
}

// Middleware automático para limpar cache em POST, PUT, PATCH e DELETE
// Deve ser aplicado nas rotas de expenses, gains e credits
export function invalidateCacheMiddleware(resource: CacheableResource) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Só invalidar cache em POST, PUT, PATCH e DELETE
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      invalidateCache(resource)

      // Também invalidar cache de results quando expenses, gains ou credits são modificados
      // pois o endpoint /results agrega dados desses recursos
      if (['expenses', 'gains', 'credits'].includes(resource)) {
        invalidateCache('results')
      }
    }
  }
}

// Configurações de cache para expenses, gains, credits, results, categories e subcategories
export const cacheConfigs = {
  expenses: {
    ttl: 5 * 60 * 1000, // 5 minutos
    endpointFlag: 'ENABLE_CACHE_EXPENSES' as const,
  },
  gains: {
    ttl: 5 * 60 * 1000, // 5 minutos
    endpointFlag: 'ENABLE_CACHE_GAINS' as const,
  },
  credits: {
    ttl: 5 * 60 * 1000, // 5 minutos
    endpointFlag: 'ENABLE_CACHE_CREDITS' as const,
  },
  results: {
    ttl: 5 * 60 * 1000, // 5 minutos
    endpointFlag: 'ENABLE_CACHE_RESULTS' as const,
  },
  categories: {
    ttl: 5 * 60 * 1000, // 5 minutos
    endpointFlag: 'ENABLE_CACHE_CATEGORIES' as const,
  },
  subcategories: {
    ttl: 5 * 60 * 1000, // 5 minutos
    endpointFlag: 'ENABLE_CACHE_SUBCATEGORIES' as const,
  },
  financialProjectionMonthDetails: {
    ttl: 5 * 60 * 1000, // 5 minutos
    endpointFlag: 'ENABLE_CACHE_FINANCIAL_PROJECTION_MONTH_DETAILS' as const,
  },
}
