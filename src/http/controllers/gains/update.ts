import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateGainUseCase } from '@/use-cases/factories/make-update-gain-use-case'
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
    isHidden: z.boolean().nullish(),
    installmentCurrent: z.number().nullish(),
    installmentTotalPayment: z.number().nullish(),
  })

  const { organizationId } = updateCheckInParamsSchema.parse(request.params)

  const reqBody = updateGymBodySchema.parse(request.body)
  const updateGainUseCase = makeUpdateGainUseCase()

  const data = await updateGainUseCase.execute({
    organizationId,
    reqBody,
  })

  // Invalidar cache de ganhos após atualização
  invalidateCache('gains')
  // Invalidar cache de results pois dependem de gains
  invalidateCache('results')

  return reply.status(201).send(data)
}
