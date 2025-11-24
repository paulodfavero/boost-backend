import { FastifyInstance } from 'fastify'
import { search, searchCreditByOrganizationId } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'
import { invalidateCacheMiddleware } from '@/http/middlewares/cache'

export async function creditsRoutes(app: FastifyInstance) {
  app.get('/credit', search)
  app.get('/credit-card/:organizationId', searchCreditByOrganizationId)
  app.post(
    '/credit/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('credits'),
    },
    create,
  )
  app.put(
    '/credit/update/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('credits'),
    },
    update,
  )
  app.patch(
    '/credit/update/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('credits'),
    },
    update,
  )
  app.delete(
    '/credit/delete/:organizationId',
    {
      preHandler: invalidateCacheMiddleware('credits'),
    },
    deleteTransaction,
  )
}
