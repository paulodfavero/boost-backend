// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

// import { search } from './search'
import { create } from './create'
import { update } from './update'

export async function organizationRoutes(app: FastifyInstance) {
  // app.get('/banks', search)
  app.post('/organization', create)
  app.put('/organization/:organizationId', update)

}
