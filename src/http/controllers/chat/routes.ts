import { FastifyInstance } from 'fastify'
import { create } from './create'

export async function chatRoutes(app: FastifyInstance) {
  app.post('/chat', create)
}
