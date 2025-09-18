interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

interface CacheConfig {
  ttl: number // Time to live em millisegundos
  maxSize?: number // Tamanho máximo do cache
  enabled: boolean
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>()
  private config: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutos por padrão
    maxSize: 1000, // 1000 itens por padrão
    enabled: true,
  }

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  set<T>(key: string, data: T, ttlMs?: number): void {
    if (!this.config.enabled) return

    // Verificar se o cache está cheio
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs || this.config.ttl,
      hits: 0,
    })
  }

  get<T>(key: string): T | null {
    if (!this.config.enabled) return null

    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // Incrementar contador de hits
    item.hits++
    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Remove o item mais antigo quando o cache está cheio
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Limpa itens expirados
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Estatísticas do cache
  getStats() {
    const now = Date.now()
    let expired = 0
    let totalHits = 0
    let totalMemoryUsage = 0
    const keyTypes: Record<string, number> = {}

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expired++
      }
      totalHits += item.hits

      // Estimar uso de memória (aproximado)
      totalMemoryUsage += JSON.stringify(item.data).length

      // Contar tipos de chaves
      const keyType = key.split(':')[0]
      keyTypes[keyType] = (keyTypes[keyType] || 0) + 1
    }

    return {
      size: this.cache.size,
      expired,
      totalHits,
      enabled: this.config.enabled,
      memoryUsage: totalMemoryUsage,
      keyTypes,
      hitRate:
        this.cache.size > 0 ? (totalHits / this.cache.size).toFixed(2) : '0.00',
      config: this.config,
    }
  }

  // Obter todas as chaves do cache
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Configurar cache
  configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Configuração para produção
const isProduction = process.env.NODE_ENV === 'production'

export const cache = new SimpleCache({
  ttl: isProduction ? 2 * 60 * 1000 : 5 * 60 * 1000, // 2 min em prod, 5 min em dev
  maxSize: isProduction ? 500 : 1000, // Menor em produção
  enabled: true,
})

// Limpa cache a cada 5 minutos em produção, 10 minutos em desenvolvimento
const cleanupInterval = isProduction ? 5 * 60 * 1000 : 10 * 60 * 1000
setInterval(() => {
  cache.cleanup()
}, cleanupInterval)
