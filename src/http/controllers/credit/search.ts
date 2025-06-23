import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  makeSearchCreditCardListUseCase,
  makeSearchCreditUseCase,
} from '@/use-cases/factories/make-search-credit-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchQueryCreditsSchema = z.object({
    a: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
  })

  const { a, date, bankId } = searchQueryCreditsSchema.parse(request.query)
  const searchCreditsUseCase = makeSearchCreditUseCase()

  const data = await searchCreditsUseCase.execute({
    organizationId: a,
    date,
    bankId: bankId || '',
  })

  return reply.status(200).send(data)
}

export async function searchCreditByOrganizationId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchQueryCreditsSchema = z.object({
    organizationId: z.string(),
  })

  const { organizationId } = searchQueryCreditsSchema.parse(request.params)
  const searchCreditsUseCase = makeSearchCreditCardListUseCase()

  const data = await searchCreditsUseCase.execute({
    organizationId,
  })
  return reply.status(200).send(data)
}
