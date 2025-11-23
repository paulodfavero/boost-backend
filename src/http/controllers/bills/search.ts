import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchBillsUseCase } from '@/use-cases/factories/make-search-bills-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchBillsQuerySchema = z.object({
    organizationId: z.string(),
    month: z.string().optional(),
    year: z.string().optional(),
    paid: z.string().optional(), // 'true' ou 'false' como string
  })

  const { organizationId, month, year, paid } = searchBillsQuerySchema.parse(
    request.query,
  )

  try {
    const searchBillsUseCase = makeSearchBillsUseCase()
    const data = await searchBillsUseCase.execute({
      organizationId,
      month,
      year,
      paid: paid === 'true' ? true : paid === 'false' ? false : undefined,
    })

    return reply.status(200).send(data)
  } catch (err) {
    console.error('Erro na busca de bills:', err)

    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error: 'Erro interno do servidor na busca de bills',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}
