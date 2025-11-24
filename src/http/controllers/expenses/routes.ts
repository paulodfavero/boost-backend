// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'
import { invalidateCacheMiddleware } from '@/http/middlewares/cache'

export async function expensesRoutes(app: FastifyInstance) {
  app.get('/expenses', search)
  app.post(
    '/expenses/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('expenses'),
    },
    create,
  )
  app.put(
    '/expenses/update/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('expenses'),
    },
    update,
  )
  app.patch(
    '/expenses/update/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('expenses'),
    },
    update,
  )
  app.delete(
    '/expenses/delete/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('expenses'),
    },
    deleteTransaction,
  )
}
