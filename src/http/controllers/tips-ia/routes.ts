import { FastifyInstance } from 'fastify'
import { create } from './create'

export async function tipsIaRoutes(app: FastifyInstance) {
  app.post('/tips-ia', create)
}
