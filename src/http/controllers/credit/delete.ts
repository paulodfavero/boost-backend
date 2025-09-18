import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteCreditUseCase } from '@/use-cases/factories/make-delete-credit-use-case'
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

  const deleteCreditUseCase = makeDeleteCreditUseCase()
  const data = await deleteCreditUseCase.execute({
    organizationId,
    transactionId,
  })

  // Invalidar cache de créditos após exclusão
  invalidateCache('credits')

  return reply.status(201).send(data)
}
