import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchCategoryUseCase } from '@/use-cases/factories/make-search-category-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchCategoriesQuerySchema = z.object({
    a: z.string(),
  })

  const { a } = searchCategoriesQuerySchema.parse(request.query)
  const searchCategoryUseCase = makeSearchCategoryUseCase()

  const data = await searchCategoryUseCase.execute({
    query: a,
  })

  return reply.status(200).send(data)
}
