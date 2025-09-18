import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateCreditUseCase } from '@/use-cases/factories/make-update-credit-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateCheckInParamsSchema = z.object({
    organizationId: z.string(),
  })

  const updateGymBodySchema = z.object({
    id: z.string(),
    expirationDate: z.string().nullish(),
    description: z.string().nullish(),
    company: z.string().nullish(),
    category: z.string().nullish(),
    amount: z.number().nullish(),
    typePayment: z.string().nullish(),
    paid: z.boolean().nullish(),
    installmentCurrent: z.number().nullish(),
    installmentTotalPayment: z.number().nullish(),
  })

  const { organizationId } = updateCheckInParamsSchema.parse(request.params)

  const reqBody = updateGymBodySchema.parse(request.body)
  const updateCreditUseCase = makeUpdateCreditUseCase()

  const data = await updateCreditUseCase.execute({
    organizationId,
    reqBody,
  })

  // Invalidar cache de créditos após atualização
  invalidateCache('credits')

  return reply.status(201).send(data)
}
