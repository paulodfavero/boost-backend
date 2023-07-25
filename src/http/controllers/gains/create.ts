import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateGainUseCase } from '@/use-cases/factories/make-create-gain-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckInParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createGymBodySchema = z.array(
    z.object({
      expirationDate: z.string(),
      description: z.string(),
      company: z.string(),
      category: z.string(),
      amount: z.number(),
      typePayment: z.string(),
      paid: z.boolean(),
      installmentCurrent: z.number().nullish(),
      installmentTotalPayment: z.number().nullish(),
      organizationId: z.string().nullish(),
    }),
  )

  const { organizationId } = createCheckInParamsSchema.parse(request.params)

  const reqBody = createGymBodySchema.parse(request.body)
  const createGainUseCase = makeCreateGainUseCase()

  const data = await createGainUseCase.execute({
    organizationId,
    reqBody,
  })

  return reply.status(201).send(data)
}
