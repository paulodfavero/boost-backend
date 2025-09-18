import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteExpenseUseCase } from '@/use-cases/factories/make-delete-expense-use-case'
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

  const deleteExpenseUseCase = makeDeleteExpenseUseCase()
  const data = await deleteExpenseUseCase.execute({
    organizationId,
    transactionId,
  })

  // Invalidar cache de despesas após exclusão
  invalidateCache('expenses')

  return reply.status(201).send(data)
}
