import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'

export async function expensesProjectionRoutes(app: FastifyInstance) {
  app.get('/expenses-projection', search)
  app.post('/expenses-projection/:organizationId', create)
  app.put('/expenses-projection/update/:organizationId', update)
  app.delete('/expenses-projection/delete/:organizationId', deleteTransaction)
}
