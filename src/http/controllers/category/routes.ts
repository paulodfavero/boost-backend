// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/category', search)
  app.post('/category/:organizationId', create)
}
