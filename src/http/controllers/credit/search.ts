import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchCreditCardListUseCase, makeSearchCreditUseCase } from '@/use-cases/factories/make-search-credit-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchQueryCreditsSchema = z.object({
    a: z.string(),
    date: z.string(),
  })

  const { a, date } = searchQueryCreditsSchema.parse(request.query)
  const searchCreditsUseCase = makeSearchCreditUseCase()

  const data = await searchCreditsUseCase.execute({
    organizationId: a,
    date,
  })

  return reply.status(200).send(data)
}

export async function searchCreditByOrganizationId(request: FastifyRequest, reply: FastifyReply) {
  const searchQueryCreditsSchema = z.object({
    organizationId: z.string(),
  })

  console.log('%csrc/http/controllers/credit/search.ts:28 a', 'color: #007acc;', request.params);
  const { organizationId } = searchQueryCreditsSchema.parse(request.params)
  const searchCreditsUseCase = makeSearchCreditCardListUseCase()

  const data = await searchCreditsUseCase.execute({
    organizationId,
  })
  return reply.status(200).send(data)

  
}