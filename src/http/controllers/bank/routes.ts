// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'

export async function bankRoutes(app: FastifyInstance) {
  app.get('/banks', search)
  app.post('/bank/:organizationId', create)
}
