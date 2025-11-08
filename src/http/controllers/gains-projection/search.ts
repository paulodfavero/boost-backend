import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchGainsProjectionUseCase } from '@/use-cases/factories/make-search-gains-projection-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchGainsProjectionQuerySchema = z.object({
    organizationId: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
    isSamePersonTransfer: z.string().nullish(),
  })

  const { organizationId, date, bankId, isSamePersonTransfer } =
    searchGainsProjectionQuerySchema.parse(request.query)

  try {
    const searchGainsProjectionUseCase = makeSearchGainsProjectionUseCase()
    const data = await searchGainsProjectionUseCase.execute({
      organizationId,
      date,
      bankId: bankId || undefined,
      isSamePersonTransfer: isSamePersonTransfer === 'true',
    })

    return reply.status(200).send(data)
  } catch (err) {
    console.error('Erro na busca de gains-projection:', err)

    // Se for erro de validação do Zod, retornar erro 400
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error: 'Erro interno do servidor na busca de gains-projection',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}
