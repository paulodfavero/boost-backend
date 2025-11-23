import { FastifyInstance } from 'fastify'

import { search } from './search'
import { create } from './create'
import { update } from './update'
import { markAsPaid } from './mark-as-paid'
import { deleteBill } from './delete'
import { generateMonthly } from './generate-monthly'

export async function billsRoutes(app: FastifyInstance) {
  app.get('/bills', search)
  app.post('/bills/:organizationId', create)
  app.put('/bills/:billId', update)
  app.patch('/bills/:billId/mark-as-paid', markAsPaid)
  app.delete('/bills/:billId', deleteBill)
  app.post('/bills/:organizationId/generate-monthly', generateMonthly)
}
