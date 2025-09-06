import { FastifyInstance } from 'fastify'

import { create } from './create'
import { search } from './search'

export async function investmentRoutes(app: FastifyInstance) {
  app.get('/investment/:organizationId', search)
  app.post('/investment/:organizationId', create)
}
