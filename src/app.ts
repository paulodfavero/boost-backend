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

const isProduction = process.env.NODE_ENV === 'production'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minuto em milissegundos
const MAX_REQUESTS = 100 // máximo de requisições por janela de tempo
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Função para limpar requisições antigas
if (isProduction) {
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

// Hook para verificar se a requisição vem de um navegador e tem headers de segurança
app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
  if (isProduction) {
    const userAgent = request.headers['user-agent']
    const secFetchSite = request.headers['sec-fetch-site']
    const secFetchMode = request.headers['sec-fetch-mode']
    const secFetchDest = request.headers['sec-fetch-dest']
    const origin = request.headers.origin
    const ip = request.ip

    // Rate limiting
    const now = Date.now()
    const requestData = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW }
    
    if (now > requestData.resetTime) {
      requestData.count = 0
      requestData.resetTime = now + RATE_LIMIT_WINDOW
    }

    requestData.count++
    requestCounts.set(ip, requestData)

    if (requestData.count > MAX_REQUESTS) {
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((requestData.resetTime - now) / 1000)} seconds.`
      })
    }

    // Verifica se é uma requisição de navegador
    const isBrowser = secFetchSite && secFetchMode && secFetchDest

    // Verifica se a origem é permitida
    const isAllowedOrigin = origin === process.env.SITE_URL

    if (!isBrowser || !isAllowedOrigin) {
      return reply.status(403).send({
        error: 'Access denied. Invalid request origin or client.'
      })
    }

    // Verifica se o User-Agent parece ser de um navegador
    const isSuspiciousUserAgent = !userAgent || 
      userAgent.toLowerCase().includes('postman') ||
      userAgent.toLowerCase().includes('insomnia') ||
      userAgent.toLowerCase().includes('curl') ||
      userAgent.toLowerCase().includes('wget')

    if (isSuspiciousUserAgent) {
      return reply.status(403).send({
        error: 'Access denied. Invalid client.'
      })
    }

    // Adiciona headers de segurança básicos
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'DENY')
    reply.header('X-XSS-Protection', '1; mode=block')
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    reply.header('Content-Security-Policy', "default-src 'self'")
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  }
})

app.register(cors, {
  origin: isProduction ? process.env.SITE_URL : true, // Em desenvolvimento permite todas as origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Itemid']
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
