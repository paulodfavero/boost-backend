import { FastifyInstance } from 'fastify'
import { search } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'

export async function gainsRoutes(app: FastifyInstance) {
  app.get('/gains', search)
  app.post('/gains/:organizationId', create)
  app.put('/gains/update/:organizationId', update)
  app.delete('/gains/delete/:organizationId', deleteTransaction)
}
