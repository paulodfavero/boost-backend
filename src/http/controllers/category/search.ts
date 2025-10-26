import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchCategoryUseCase } from '@/use-cases/factories/make-search-category-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware(cacheConfigs.categories)(request, reply)

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchCategoriesQuerySchema = z.object({
    organizationId: z.string(),
    query: z.string().optional().default(''),
  })

  const { organizationId, query } = searchCategoriesQuerySchema.parse(
    request.query,
  )
  const searchCategoryUseCase = makeSearchCategoryUseCase()

  const data = await searchCategoryUseCase.execute({
    organizationId,
    query,
  })

  // Salvar no cache
  saveToCache(request, data, cacheConfigs.categories)

  return reply.status(200).send(data)
}
