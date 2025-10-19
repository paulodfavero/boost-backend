import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'
import { update } from './update'
import { findById } from './find-by-id'
import { deleteWallet } from './delete'

export async function walletRoutes(app: FastifyInstance) {
  app.get('/wallets/:organizationId', search)
  app.get('/wallet/:organizationId', findById)
  app.post('/wallet/:organizationId', create)
  app.put('/wallet/:walletId', update)
  app.delete('/wallet/:walletId', deleteWallet)
}
