import { FastifyReply, FastifyRequest } from 'fastify'

import { makeSearchCategoryCreditCardUseCase } from '@/use-cases/factories/make-search-category-credit-card-use-case'

export async function searchMany(request: FastifyRequest, reply: FastifyReply) {
  const searchCategoryId = makeSearchCategoryCreditCardUseCase()

  const data = await searchCategoryId.execute()

  return reply.status(200).send(data)
}
