import { FastifyInstance } from 'fastify'
import { search } from './search'

export async function creditsRecurrentRoutes(app: FastifyInstance) {
  app.get('/credits-recurrent', search)
}
