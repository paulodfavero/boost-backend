// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

// import { search } from './search'
import { create } from './create'

export async function suggestionRoutes(app: FastifyInstance) {
  // app.get('/banks', search)
  app.post('/suggestion/:organizationId', create)
}
