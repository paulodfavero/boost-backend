import fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
// import jwt from '@fastify/jwt'
// import { env } from '@/env'

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
import { goalsRoutes } from './http/controllers/goals/routes'
import { categoryCreditCardRoutes } from './http/controllers/categoryCreditCard/routes'
import { subcategoryCreditCardRoutes } from './http/controllers/subcategoryCreditCard/routes'
import { paymentRoutes } from './http/controllers/payment/routes'
import { investmentRoutes } from './http/controllers/investment/routes'
import { chatRoutes } from './http/controllers/chat/routes'
import { tipsIaRoutes } from './http/controllers/tips-ia/routes'
import { accessLogRoutes } from './http/controllers/access-log/routes'
import { cacheRoutes } from './http/controllers/cache/routes'

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

// app.register(jwt, {
//   secret: env.JWT_SECRET,
// })

// app.addHook('preHandler', async (request, reply) => {
//   try {
//     await request.jwtVerify() // se usa fastify-jwt
//   } catch (err) {
//     return reply.status(401).send({ error: 'Token inválido ou ausente' })
//   }
// })
// app.addHook('preHandler', async (request, reply) => {
//   const origin = request.headers.origin || request.headers.referer
//   // const apiKey = request.headers['x-api-key']
//   // const expectedApiKey = process.env.API_KEY
//   if (
//     !origin ||
//     (!origin.includes('www.boostfinance.com.br') &&
//       !origin.includes('http://localhost:3000'))
//   ) {
//     return reply.status(403).send({ error: 'Acesso negado' })
//   }
//   // if (!apiKey || apiKey !== expectedApiKey) {
//   // return reply.status(401).send({ error: 'Acesso negado: chave inválida' })
//   // }
// })
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
  allowedHeaders: ['Content-Type', 'Authorization', 'Itemid', 'BankId'],
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
app.register(goalsRoutes)
app.register(categoryCreditCardRoutes)
app.register(subcategoryCreditCardRoutes)
app.register(paymentRoutes)
app.register(investmentRoutes)
app.register(chatRoutes)
app.register(tipsIaRoutes)
app.register(accessLogRoutes)
app.register(cacheRoutes)
