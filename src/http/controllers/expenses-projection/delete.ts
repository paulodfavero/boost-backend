import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteExpensesProjectionUseCase } from '@/use-cases/factories/make-delete-expenses-projection-use-case'
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

  const deleteExpensesProjectionUseCase = makeDeleteExpensesProjectionUseCase()
  const data = await deleteExpensesProjectionUseCase.execute({
    organizationId,
    transactionId,
  })

  // Invalidar cache de despesas após exclusão
  invalidateCache('expenses-projection')
  // Invalidar cache de financial projection month details
  invalidateCache('financial-projection-month-details')

  return reply.status(201).send(data)
}
