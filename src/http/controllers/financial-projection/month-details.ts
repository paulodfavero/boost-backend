import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchFinancialProjectionMonthDetailsUseCase } from '@/use-cases/factories/make-search-financial-projection-month-details-use-case'
import {
  cacheMiddleware,
  saveToCache,
  cacheConfigs,
} from '@/http/middlewares/cache'

export async function monthDetails(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Aplicar middleware de cache
  await cacheMiddleware(
    'financial-projection-month-details',
    cacheConfigs.financialProjectionMonthDetails,
  )(request, reply)

  // Se o cache retornou dados, a função já foi finalizada
  if (reply.sent) {
    return
  }

  const searchFinancialProjectionMonthDetailsQuerySchema = z.object({
    organizationId: z.string(),
    month: z.string(),
  })

  const { organizationId, month } =
    searchFinancialProjectionMonthDetailsQuerySchema.parse(request.query)

  try {
    const searchFinancialProjectionMonthDetailsUseCase =
      makeSearchFinancialProjectionMonthDetailsUseCase()
    const data = await searchFinancialProjectionMonthDetailsUseCase.execute({
      organizationId,
      month,
    })

    // Salvar no cache
    saveToCache(
      'financial-projection-month-details',
      request,
      data,
      cacheConfigs.financialProjectionMonthDetails,
    )

    return reply.status(200).send(data)
  } catch (err) {
    console.error('Erro na busca de financial-projection month-details:', err)

    // Se for erro de validação do Zod, retornar erro 400
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error:
        'Erro interno do servidor na busca de financial-projection month-details',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}
