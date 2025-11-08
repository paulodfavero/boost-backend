import { FastifyInstance } from 'fastify'
import { search } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'

export async function gainsProjectionRoutes(app: FastifyInstance) {
  app.get('/gains-projection', search)
  app.post('/gains-projection/:organizationId', create)
  app.put('/gains-projection/update/:organizationId', update)
  app.delete('/gains-projection/delete/:organizationId', deleteTransaction)
}
