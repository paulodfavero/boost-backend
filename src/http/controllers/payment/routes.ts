import { FastifyInstance } from 'fastify'
import { createPaymentSheet } from './create'

export async function paymentRoutes(app: FastifyInstance) {
  app.post('/payment-sheet', createPaymentSheet)
}
