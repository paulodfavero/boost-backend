import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateExpenseUseCase } from '@/use-cases/factories/make-create-expense-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCheckInParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createExpenseBodySchema = z.array(
    z.object({
      expirationDate: z.string(),
      purchaseDate: z.string().nullish(),
      balanceCloseDate: z.string().nullish(),
      description: z.string(),
      bankTransactionId: z.string().nullish(),
      company: z.string(),
      category: z.string().nullish(),
      amount: z.number(),
      typePayment: z.string(),
      operationType: z.string().nullish(),
      paymentData: z.string().nullish(),
      paid: z.boolean(),
      installmentCurrent: z.number().nullish(),
      installmentTotalPayment: z.number().nullish(),
      bankId: z.string().nullish(),
      bankTypeAccountId: z.string().nullish(),
      merchant: z
        .object({
          businessName: z.string().nullish(),
          cnpj: z.string().nullish(),
          name: z.string().nullish(),
          cnae: z.string().nullish(),
        })
        .nullish(),
    }),
  )

  const { organizationId } = createCheckInParamsSchema.parse(request.params)

  const reqBody = createExpenseBodySchema.parse(request.body)
  const createExpenseUseCase = makeCreateExpenseUseCase()

  const data = await createExpenseUseCase.execute({
    organizationId,
    reqBody,
  })

  // Invalidar cache de despesas após criação
  invalidateCache('expenses')
  // Invalidar cache de results também, pois são calculados com base em expenses
  invalidateCache('results')

  return reply.status(201).send(data)
}
