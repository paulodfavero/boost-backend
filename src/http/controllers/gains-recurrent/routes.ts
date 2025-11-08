import { FastifyInstance } from 'fastify'
import { search } from './search'

export async function gainsRecurrentRoutes(app: FastifyInstance) {
  app.get('/gains-recurrent', search)
}
