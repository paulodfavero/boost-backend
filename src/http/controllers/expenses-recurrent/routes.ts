import { FastifyInstance } from 'fastify'
import { search } from './search'

export async function expensesRecurrentRoutes(app: FastifyInstance) {
  app.get('/expenses-recurrent', search)
}
