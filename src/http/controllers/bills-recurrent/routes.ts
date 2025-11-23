import { FastifyInstance } from 'fastify'
import { search } from './search'

export async function billsRecurrentRoutes(app: FastifyInstance) {
  app.get('/bills-recurrent', search)
}
