// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import {
  search,
  searchBankTypeAccount,
  searchBanksOrganizationId,
} from './search'
import { create, createBankTypeAccount } from './create'
import { deleteBank } from './delete'
import { update } from './update'
import { updateBankTypeAccount } from './update-bank-type-account'

export async function bankRoutes(app: FastifyInstance) {
  app.get('/banks', search)
  app.post('/bank/:organizationId', create)
  app.get('/bankTypeAccount/:id', searchBankTypeAccount)
  app.get('/banks/:organizationId', searchBanksOrganizationId)
  app.delete('/bank/:organizationId', deleteBank)
  app.post('/bankTypeAccount/:organizationId', createBankTypeAccount)
  app.put('/bank/:bankId/:organizationId', update)
  app.put(
    '/bankTypeAccount/:bankTypeAccountId/:organizationId',
    updateBankTypeAccount,
  )
}
