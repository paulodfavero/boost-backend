import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteCreditsProjectionUseCase } from '@/use-cases/factories/make-delete-credits-projection-use-case'
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

  const { organizationId } = deleteCheckInParamsSchema.parse(request.params)
  const { id: transactionId } = deleteBodySchema.parse(request.body)

  const deleteCreditsProjectionUseCase = makeDeleteCreditsProjectionUseCase()
  const data = await deleteCreditsProjectionUseCase.execute({
    organizationId,
    transactionId,
  })

  // Invalidar cache de créditos após exclusão
  invalidateCache('credits-projection')
  // Invalidar cache de financial projection month details
  invalidateCache('financial-projection-month-details')

  return reply.status(201).send(data)
}
