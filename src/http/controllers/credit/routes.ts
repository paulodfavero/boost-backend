import { FastifyInstance } from 'fastify'
import { search } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'

export async function creditsRoutes(app: FastifyInstance) {
  app.get('/credit', search)
  app.post('/credit/:organizationId', create)
  app.put('/credit/update/:organizationId', update)
  app.delete('/credit/delete/:organizationId', deleteTransaction)
}
