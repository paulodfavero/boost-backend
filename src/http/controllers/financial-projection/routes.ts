import { FastifyInstance } from 'fastify'
import { summary } from './summary'
import { monthDetails } from './month-details'

export async function financialProjectionRoutes(app: FastifyInstance) {
  app.get('/financial-projection/summary', summary)
  app.get('/financial-projection/month-details', monthDetails)
}
