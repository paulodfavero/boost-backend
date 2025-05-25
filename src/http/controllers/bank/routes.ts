// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import {
  search,
  searchBankTypeAccount,
  searchBanksOrganizationId,
} from './search'
import { create, createBankTypeAccount } from './create'
import { deleteBank } from './delete'

export async function bankRoutes(app: FastifyInstance) {
  app.get('/banks', search)
  app.post('/bank/:organizationId', create)
  app.get('/bankTypeAccount/:id', searchBankTypeAccount)
  app.get('/banks/:organizationId', searchBanksOrganizationId)
  app.delete('/bank/:organizationId', deleteBank)
  app.post('/bankTypeAccount/:organizationId', createBankTypeAccount)
}
