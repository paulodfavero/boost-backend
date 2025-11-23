import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateBillUseCase } from '@/use-cases/factories/make-update-bill-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBillParamsSchema = z.object({
    billId: z.string(),
  })

  const updateBillBodySchema = z.object({
    description: z.string().optional(),
    company: z.string().optional(),
    category: z.string().nullish().optional(),
    amount: z.number().optional(),
    expirationDate: z.string().optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    active: z.boolean().optional(),
  })

  const { billId } = updateBillParamsSchema.parse(request.params)
  const reqBody = updateBillBodySchema.parse(request.body)

  const updateBillUseCase = makeUpdateBillUseCase()

  const data = await updateBillUseCase.execute({
    billId,
    ...reqBody,
  })

  return reply.status(200).send(data)
}
