import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchResultUseCase } from '@/use-cases/factories/make-search-results-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware('results', cacheConfigs.results)(request, reply)

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchExpensesQuerySchema = z.object({
    a: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
    isSamePersonTransfer: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  })

  const { a, date, bankId, isSamePersonTransfer } =
    searchExpensesQuerySchema.parse(request.query)
  const searchExpenseUseCase = makeSearchResultUseCase()

  const data = await searchExpenseUseCase.execute({
    organizationId: a,
    date,
    bankId: bankId || undefined,
    isSamePersonTransfer: isSamePersonTransfer || false,
  })

  // Salvar no cache
  saveToCache('results', request, data, cacheConfigs.results)

  return reply.status(200).send(data)
}
