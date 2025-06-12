import { FastifyReply, FastifyRequest } from 'fastify'

import { makeSearchCategoryUseCase } from '@/use-cases/factories/make-search-subcategory-use-case'

export async function searchMany(request: FastifyRequest, reply: FastifyReply) {
  const searchSubcategory = makeSearchCategoryUseCase()

  const data = await searchSubcategory.execute()

  return reply.status(200).send(data)
}
