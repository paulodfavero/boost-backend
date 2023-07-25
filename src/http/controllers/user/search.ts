import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchBankUseCase } from '@/use-cases/factories/make-search-bank-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchBanksQuerySchema = z.object({
    a: z.string(),
  })

  const { a } = searchBanksQuerySchema.parse(request.query)
  const searchBankUseCase = makeSearchBankUseCase()

  const data = await searchBankUseCase.execute({
    query: a,
  })

  return reply.status(200).send(data)
}
