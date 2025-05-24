// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search, searchBankTypeAccount } from './search'
import { create, createBankTypeAccount } from './create'
import { deleteBank } from './delete'

export async function bankRoutes(app: FastifyInstance) {
  app.get('/banks', search)
  app.post('/bank/:organizationId', create)
  app.get('/bankTypeAccount/:id', searchBankTypeAccount)
  app.delete('/bank/:organizationId', deleteBank)
  app.post('/bankTypeAccount/:organizationId', createBankTypeAccount)
}
