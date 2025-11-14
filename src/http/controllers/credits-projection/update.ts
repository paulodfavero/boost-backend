import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateCreditsProjectionUseCase } from '@/use-cases/factories/make-update-credits-projection-use-case'
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
  const updateCreditsProjectionUseCase = makeUpdateCreditsProjectionUseCase()

  const data = await updateCreditsProjectionUseCase.execute({
    organizationId,
    reqBody,
  })

  // Invalidar cache de créditos após atualização
  invalidateCache('credits-projection')
  // Invalidar cache de financial projection month details
  invalidateCache('financial-projection-month-details')

  return reply.status(201).send(data)
}
