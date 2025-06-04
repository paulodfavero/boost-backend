import fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'

import { expensesRoutes } from '@/http/controllers/expenses/routes'
import { gainsRoutes } from '@/http/controllers/gains/routes'
import { categoryRoutes } from '@/http/controllers/category/routes'
import { companyRoutes } from './http/controllers/company/routes'
import { bankRoutes } from './http/controllers/bank/routes'
import { organizationRoutes } from './http/controllers/organization/routes'
import { userRoutes } from './http/controllers/user/routes'
import { suggestionRoutes } from './http/controllers/suggestion/routes'
import { resultsRoutes } from './http/controllers/results/routes'
import { creditsRoutes } from './http/controllers/credit/routes'
import { env } from './env'

const isDevelopment = process.env.NODE_ENV === 'dev'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto em milissegundos
const MAX_REQUESTS = 100 // máximo de requisições por janela de tempo
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Função para limpar requisições antigas
if (isDevelopment) {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key)
      }
    }
  }, RATE_LIMIT_WINDOW)
}

export const app = fastify()

// Hook para verificar rate limit e ferramentas de desenvolvimento
app.addHook(
  'onRequest',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const userAgent = request.headers['user-agent']
    const ip = request.ip

    // Rate limiting apenas em produção
    if (isDevelopment) {
      const now = Date.now()
      const requestData = requestCounts.get(ip) || {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW,
      }

      if (now > requestData.resetTime) {
        requestData.count = 0
        requestData.resetTime = now + RATE_LIMIT_WINDOW
      }

      requestData.count++
      requestCounts.set(ip, requestData)

      if (requestData.count > MAX_REQUESTS) {
        return reply.status(429).send({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(
            (requestData.resetTime - now) / 1000,
          )} seconds.`,
        })
      }
    }

    // Bloqueia ferramentas de desenvolvimento
    if (
      userAgent &&
      (userAgent.toLowerCase().includes('postman') ||
        userAgent.toLowerCase().includes('insomnia') ||
        userAgent.toLowerCase().includes('curl') ||
        userAgent.toLowerCase().includes('wget'))
    ) {
      return reply.status(403).send({
        error: 'Access denied. Development tools are not allowed.',
      })
    }

    // Headers de segurança básicos
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
    reply.header('X-XSS-Protection', '1; mode=block')
    reply.header(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    )
    reply.header('Content-Security-Policy', "default-src 'self'")
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  },
)

app.register(cors, {
  origin: process.env.SITE_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Itemid'],
})

app.register(resultsRoutes)
app.register(expensesRoutes)
app.register(gainsRoutes)
app.register(categoryRoutes)
app.register(companyRoutes)
app.register(bankRoutes)
app.register(organizationRoutes)
app.register(userRoutes)
app.register(suggestionRoutes)
app.register(creditsRoutes)
