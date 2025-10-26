import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchExpensesProjectionUseCase } from '@/use-cases/factories/make-search-expenses-projection-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchExpensesProjectionQuerySchema = z.object({
    organizationId: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
    isSamePersonTransfer: z.string().nullish(),
  })

  const { organizationId, date, bankId, isSamePersonTransfer } =
    searchExpensesProjectionQuerySchema.parse(request.query)

  try {
    const searchExpensesProjectionUseCase =
      makeSearchExpensesProjectionUseCase()
    const data = await searchExpensesProjectionUseCase.execute({
      organizationId,
      date,
      bankId: bankId || undefined,
      isSamePersonTransfer: isSamePersonTransfer === 'true',
    })

    return reply.status(200).send(data)
  } catch (err) {
    return reply.status(409).send({ message: err })
  }
}
