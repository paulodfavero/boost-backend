// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'

export async function expensesRoutes(app: FastifyInstance) {
  app.get('/expenses', search)
  app.post('/expenses/:organizationId', create)
  app.put('/expenses/update/:organizationId', update)
  app.delete('/expenses/delete/:organizationId', deleteTransaction)
}
