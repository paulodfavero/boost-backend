import { FastifyInstance } from 'fastify'
import { search, searchCreditsProjectionByOrganizationId } from './search'
import { create } from './create'
import { update } from './update'
import { deleteTransaction } from './delete'

export async function creditsProjectionRoutes(app: FastifyInstance) {
  app.get('/credits-projection', search)
  app.get(
    '/credits-projection-card/:organizationId',
    searchCreditsProjectionByOrganizationId,
  )
  app.post('/credits-projection/:organizationId', create)
  app.put('/credits-projection/update/:organizationId', update)
  app.delete('/credits-projection/delete/:organizationId', deleteTransaction)
}
