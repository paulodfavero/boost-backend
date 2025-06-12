import { FastifyInstance } from 'fastify'

import { createMany } from './create'

import { searchMany } from './search'

export async function subcategoryCreditCardRoutes(app: FastifyInstance) {
  // app.get('/subcategory/:id', search)
  app.get('/subcategories', searchMany)
  app.post('/subcategories', createMany)
}
