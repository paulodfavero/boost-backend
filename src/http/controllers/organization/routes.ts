// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

// import { search } from './search'
import { create } from './create'
import { update } from './update'
import { search, searchMany } from './search'
import { login } from './login'

export async function organizationRoutes(app: FastifyInstance) {
  app.get('/organization/:id', search)
  app.get('/organizations', searchMany)
  app.post('/organization', create)
  app.put('/organization/:organizationId', update)
  app.post('/organization/login', login)
}
