import { FastifyInstance } from 'fastify'
import { createPaymentSheet } from './create'
import { createCheckoutSession } from './checkout-sessions'
import { checkSession } from './check-session'

export async function paymentRoutes(app: FastifyInstance) {
  app.post('/payment-sheet', createPaymentSheet)
  app.post('/checkout-sessions', createCheckoutSession)
  app.post('/check-session', checkSession)
}
