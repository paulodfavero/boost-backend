import { FastifyInstance } from 'fastify'

import { create } from './create'
import { update } from './update'
import { search } from './search'
import { remove } from './delete'

export async function goalsRoutes(app: FastifyInstance) {
  app.get('/goals/:organizationId', search)
  app.post('/goals/:organizationId', create)
  app.put('/goals/:goalId', update)
  app.delete('/goals/:goalId', remove)
}
