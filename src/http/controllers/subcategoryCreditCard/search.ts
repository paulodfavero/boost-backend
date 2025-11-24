import { FastifyReply, FastifyRequest } from 'fastify'

import { makeSearchCategoryUseCase } from '@/use-cases/factories/make-search-subcategory-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function searchMany(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware('subcategories', cacheConfigs.subcategories)(
    request,
    reply,
  )

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchSubcategory = makeSearchCategoryUseCase()

  const data = await searchSubcategory.execute()

  // Salvar no cache
  saveToCache('subcategories', request, data, cacheConfigs.subcategories)

  // Definir headers para controlar cache do navegador
  // Cache por 5 minutos no navegador, mas pode ser invalidado pelo servidor
  reply.header('Cache-Control', 'public, max-age=300, must-revalidate')
  reply.header('ETag', `"subcategories-${Date.now()}"`)

  return reply.status(200).send(data)
}
