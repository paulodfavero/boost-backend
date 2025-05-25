import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchGainUseCase } from '@/use-cases/factories/make-search-gain-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchQueryGainsSchema = z.object({
    a: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
  })

  const { a, date, bankId } = searchQueryGainsSchema.parse(request.query)
  const searchGainsUseCase = makeSearchGainUseCase()

  const data = await searchGainsUseCase.execute({
    organizationId: a,
    date,
    bankId: bankId || '',
  })

  return reply.status(200).send(data)
}
