import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchFinancialProjectionSummaryUseCase } from '@/use-cases/factories/make-search-financial-projection-summary-use-case'

export async function summary(request: FastifyRequest, reply: FastifyReply) {
  const searchFinancialProjectionSummaryQuerySchema = z.object({
    organizationId: z.string(),
    months: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined)),
    startMonth: z.string().optional(),
  })

  const { organizationId, months, startMonth } =
    searchFinancialProjectionSummaryQuerySchema.parse(request.query)

  try {
    const searchFinancialProjectionSummaryUseCase =
      makeSearchFinancialProjectionSummaryUseCase()
    const data = await searchFinancialProjectionSummaryUseCase.execute({
      organizationId,
      months,
      startMonth,
    })

    return reply.status(200).send(data)
  } catch (err) {
    console.error('Erro na busca de financial-projection summary:', err)

    // Se for erro de validação do Zod, retornar erro 400
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error:
        'Erro interno do servidor na busca de financial-projection summary',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}
