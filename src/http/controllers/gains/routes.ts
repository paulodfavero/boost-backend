import { FastifyInstance } from 'fastify'
import { search } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'
import { invalidateCacheMiddleware } from '@/http/middlewares/cache'

export async function gainsRoutes(app: FastifyInstance) {
  app.get('/gains', search)
  app.post(
    '/gains/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('gains'),
    },
    create,
  )
  app.put(
    '/gains/update/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('gains'),
    },
    update,
  )
  app.patch(
    '/gains/update/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('gains'),
    },
    update,
  )
  app.delete(
    '/gains/delete/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('gains'),
    },
    deleteTransaction,
  )
}
