import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteCategoryUseCase } from '@/use-cases/factories/make-delete-category-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function deleteCategory(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteCategoryParamsSchema = z.object({
    organizationId: z.string(),
    categoryId: z.string(),
  })

  const { organizationId, categoryId } = deleteCategoryParamsSchema.parse(
    request.params,
  )

  const deleteCategoryUseCase = makeDeleteCategoryUseCase()

  const data = await deleteCategoryUseCase.execute({
    organizationId,
    categoryId,
  })

  // Invalidar cache de categorias após exclusão
  invalidateCache('categories')

  return reply.status(200).send(data)
}
