import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteGainUseCase } from '@/use-cases/factories/make-delete-gain-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function deleteTransaction(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteCheckInParamsSchema = z.object({
    organizationId: z.string(),
  })
  const deleteBodySchema = z.object({
    id: z.string(),
  })

  // const updateGymBodySchema = z.object({
  //   id: z.string(),
  //   expirationDate: z.string().nullish(),
  //   description: z.string().nullish(),
  //   company: z.string().nullish(),
  //   category: z.string().nullish(),
  //   amount: z.number().nullish(),
  //   typePayment: z.string().nullish(),
  //   paid: z.boolean().nullish(),
  //   installmentCurrent: z.number().nullish(),
  //   installmentTotalPayment: z.number().nullish(),
  //   organizationId: z.string().nullish(),
  // })

  const { organizationId } = deleteCheckInParamsSchema.parse(request.params)
  const { id: transactionId } = deleteBodySchema.parse(request.body)

  console.log(
    '%cdelete.ts line:32 object',
    'color: #007acc;',
    organizationId,
    transactionId,
  )

  const deleteGainUseCase = makeDeleteGainUseCase()
  const data = await deleteGainUseCase.execute({
    organizationId,
    transactionId,
  })

  // Invalidar cache de ganhos após exclusão
  invalidateCache('gains')

  return reply.status(201).send(data)
}
