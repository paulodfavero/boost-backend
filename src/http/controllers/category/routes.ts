// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'
import { deleteCategory } from './delete'

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/category', search)
  app.post('/category/:organizationId', create)
  app.delete('/category/:organizationId/:categoryId', deleteCategory)
}
