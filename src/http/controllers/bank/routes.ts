// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search, searchBankTypeAccount } from './search'
import { create, createBankTypeAccount } from './create'

export async function bankRoutes(app: FastifyInstance) {
  app.get('/banks', search)
  app.post('/bank/:organizationId', create)
  app.get('/bankTypeAccount/:id', searchBankTypeAccount)
  app.post('/bankTypeAccount/:organizationId', createBankTypeAccount)
}
