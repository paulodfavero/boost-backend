import { FastifyReply, FastifyRequest } from 'fastify'

import { makeSearchCategoryUseCase } from '@/use-cases/factories/make-search-category-use-case'

export async function searchMany(request: FastifyRequest, reply: FastifyReply) {
  const searchCategoryId = makeSearchCategoryUseCase()

  const data = await searchCategoryId.execute()

  return reply.status(200).send(data)
}
