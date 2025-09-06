import { FastifyInstance } from 'fastify'
import { searchAccessLogs } from './search'

export async function accessLogRoutes(app: FastifyInstance) {
  app.get('/access-logs/:organizationId', searchAccessLogs)
}
