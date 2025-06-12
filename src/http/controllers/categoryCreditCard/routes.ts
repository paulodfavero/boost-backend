import { FastifyInstance } from 'fastify'

import { createMany } from './create'

import { searchMany } from './search'

export async function categoryCreditCardRoutes(app: FastifyInstance) {
  app.get('/categoriesCreditCard', searchMany)
  app.post('/categoriesCreditCard', createMany)
}
