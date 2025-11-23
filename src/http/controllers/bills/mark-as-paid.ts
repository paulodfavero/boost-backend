import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeMarkBillAsPaidUseCase } from '@/use-cases/factories/make-mark-bill-as-paid-use-case'

export async function markAsPaid(request: FastifyRequest, reply: FastifyReply) {
  const markAsPaidParamsSchema = z.object({
    billId: z.string(),
  })

  const markAsPaidBodySchema = z.object({
    paid: z.boolean().optional(),
  })

  const { billId } = markAsPaidParamsSchema.parse(request.params)
  const body = request.body ? markAsPaidBodySchema.parse(request.body) : {}
  const paid = body.paid ?? true

  const markBillAsPaidUseCase = makeMarkBillAsPaidUseCase()

  const data = await markBillAsPaidUseCase.execute({
    billId,
    paid,
  })

  return reply.status(200).send(data)
}
