import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchGainUseCase } from '@/use-cases/factories/make-search-gain-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware('gains', cacheConfigs.gains)(request, reply)

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchQueryGainsSchema = z.object({
    a: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
    isSamePersonTransfer: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  })

  const { a, date, bankId, isSamePersonTransfer } =
    searchQueryGainsSchema.parse(request.query)
  const searchGainsUseCase = makeSearchGainUseCase()

  const data = await searchGainsUseCase.execute({
    organizationId: a,
    date,
    bankId: bankId || '',
    isSamePersonTransfer: isSamePersonTransfer || false,
  })

  // Salvar no cache
  saveToCache('gains', request, data, cacheConfigs.gains)

  return reply.status(200).send(data)
}
