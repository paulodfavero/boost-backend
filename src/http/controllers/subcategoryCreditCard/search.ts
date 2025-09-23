import { FastifyReply, FastifyRequest } from 'fastify'

import { makeSearchCategoryUseCase } from '@/use-cases/factories/make-search-subcategory-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function searchMany(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware(cacheConfigs.subcategories)(request, reply)

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchSubcategory = makeSearchCategoryUseCase()

  const data = await searchSubcategory.execute()

  // Salvar no cache
  saveToCache(request, data, cacheConfigs.subcategories)

  return reply.status(200).send(data)
}
