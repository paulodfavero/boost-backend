import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchResultUseCase } from '@/use-cases/factories/make-search-results-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchExpensesQuerySchema = z.object({
    a: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
  })

  const { a, date, bankId } = searchExpensesQuerySchema.parse(request.query)
  const searchExpenseUseCase = makeSearchResultUseCase()

  const data = await searchExpenseUseCase.execute({
    organizationId: a,
    date,
    bankId,
  })

  return reply.status(200).send(data)
}
