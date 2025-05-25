// import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'

import { search } from './search'

export async function resultsRoutes(app: FastifyInstance) {
  app.get('/results', search)
}
