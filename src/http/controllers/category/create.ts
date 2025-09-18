import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateCategoryUseCase } from '@/use-cases/factories/make-create-category-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createCategoryParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createCategoryBodySchema = z.object({
    name: z.string(),
  })
  const { organizationId } = createCategoryParamsSchema.parse(request.params)

  const { name } = createCategoryBodySchema.parse(request.body)
  const createCategoryUseCase = makeCreateCategoryUseCase()

  const data = await createCategoryUseCase.execute({
    name,
    organizationId,
  })

  // Invalidar cache de categorias após criação
  invalidateCache('categories')

  return reply.status(201).send(data)
}
