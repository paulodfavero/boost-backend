import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateExpenseUseCase } from '@/use-cases/factories/make-update-expense-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateCheckInParamsSchema = z.object({
    organizationId: z.string(),
  })

  const updateBodySchema = z.object({
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
    organizationId: z.string().nullish(),
  })

  const { organizationId } = updateCheckInParamsSchema.parse(request.params)

  const reqBody = updateBodySchema.parse(request.body)
  const updateExpenseUseCase = makeUpdateExpenseUseCase()

  const data = await updateExpenseUseCase.execute({
    organizationId,
    reqBody,
  })

  // Invalidar cache de despesas após atualização
  invalidateCache('expenses')

  return reply.status(201).send(data)
}
