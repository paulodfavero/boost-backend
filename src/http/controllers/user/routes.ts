// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

// import { search } from './search'
import { create } from './create'

export async function userRoutes(app: FastifyInstance) {
  // app.get('/banks', search)
  app.post('/user/:organizationId', create)
}
