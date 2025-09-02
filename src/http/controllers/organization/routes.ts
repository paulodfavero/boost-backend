// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

// import { search } from './search'
import { create } from './create'
import { update } from './update'
import { search, searchMany } from './search'
import { login } from './login'
import { forgotPassword } from './forgot-password'
import { resetPassword } from './reset-password'

export async function organizationRoutes(app: FastifyInstance) {
  app.get('/organization/:id', search)
  app.get('/organizations', searchMany)
  app.post('/organization', create)
  app.put('/organization/:organizationId', update)
  app.post('/organization/login', login)
  app.post('/organization/forgot-password', forgotPassword)
  app.post('/organization/reset-password', resetPassword)
}
