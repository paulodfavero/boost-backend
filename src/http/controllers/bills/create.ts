import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateBillUseCase } from '@/use-cases/factories/make-create-bill-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBillParamsSchema = z.object({
    organizationId: z.string(),
  })

  const createBillBodySchema = z.object({
    description: z.string(),
    company: z.string().optional(),
    category: z.string().nullish(),
    amount: z.number(),
    expirationDate: z.string(),
    dayOfMonth: z.number().min(1).max(31),
    sourceTransactionId: z.string().nullish(),
  })

  const { organizationId } = createBillParamsSchema.parse(request.params)
  const reqBody = createBillBodySchema.parse(request.body)

  const createBillUseCase = makeCreateBillUseCase()

  const data = await createBillUseCase.execute({
    ...reqBody,
    organizationId,
  })

  return reply.status(201).send(data)
}
