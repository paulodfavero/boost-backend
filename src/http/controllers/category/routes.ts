import { FastifyInstance } from 'fastify'

import { createMany } from './create'

import { searchMany } from './search'

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/categories', searchMany)
  app.post('/categories', createMany)
}
