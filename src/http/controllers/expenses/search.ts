import { makeSearchExpenseUseCase } from '@/use-cases/factories/make-search-expense-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  // Aplicar middleware de cache
  await cacheMiddleware(cacheConfigs.expenses)(request, reply)

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
  const searchExpenseUseCase = makeSearchExpenseUseCase()

  const data = await searchExpenseUseCase.execute({
    organizationId: a,
    date,
    bankId: bankId || '',
    isSamePersonTransfer: isSamePersonTransfer || false,
  })

  // Salvar no cache
  saveToCache(request, data, cacheConfigs.expenses)

  // Adicionar headers para controlar cache do navegador
  // Permitir cache mas forçar revalidação quando necessário
  reply.header('Cache-Control', 'no-cache, must-revalidate')
  reply.header('X-Cache-Status', 'MISS')

  return reply.status(200).send(data)
}
