import { FastifyInstance } from 'fastify'
import { create } from './create'

export async function financialScoreRoutes(app: FastifyInstance) {
  app.post('/financial-score', create)
}
