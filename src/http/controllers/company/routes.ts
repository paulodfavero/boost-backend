// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'

export async function companyRoutes(app: FastifyInstance) {
  app.get('/company', search)
  app.post('/company/:organizationId', create)
}
