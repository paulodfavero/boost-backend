import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchCompanyUseCase } from '@/use-cases/factories/make-search-company-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware(cacheConfigs.companies)(request, reply)

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchCompaniesQuerySchema = z.object({
    a: z.string(),
  })

  const { a } = searchCompaniesQuerySchema.parse(request.query)
  const searchCompanyUseCase = makeSearchCompanyUseCase()

  const data = await searchCompanyUseCase.execute({
    query: a,
  })

  // Salvar no cache
  saveToCache(request, data, cacheConfigs.companies)

  return reply.status(200).send(data)
}
