import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchFinancialProjectionMonthDetailsUseCase } from '@/use-cases/factories/make-search-financial-projection-month-details-use-case'

export async function monthDetails(
  request: FastifyRequest,
  reply: FastifyReply,
) {
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
