import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchCreditsProjectionUseCase } from '@/use-cases/factories/make-search-credits-projection-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchCreditsProjectionQuerySchema = z.object({
    organizationId: z.string(),
    date: z.string(),
    bankId: z.string().nullish(),
    isSamePersonTransfer: z.string().nullish(),
  })

  const { organizationId, date, bankId, isSamePersonTransfer } =
    searchCreditsProjectionQuerySchema.parse(request.query)

  try {
    const searchCreditsProjectionUseCase = makeSearchCreditsProjectionUseCase()
    const data = await searchCreditsProjectionUseCase.execute({
      organizationId,
      date,
      bankId: bankId || undefined,
      isSamePersonTransfer: isSamePersonTransfer === 'true',
    })

    return reply.status(200).send(data)
  } catch (err) {
    console.error('Erro na busca de credits-projection:', err)

    // Se for erro de validação do Zod, retornar erro 400
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error: 'Erro interno do servidor na busca de credits-projection',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}

export async function searchCreditsProjectionByOrganizationId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchCreditsProjectionByOrganizationIdParamsSchema = z.object({
    organizationId: z.string(),
  })

  const { organizationId } =
    searchCreditsProjectionByOrganizationIdParamsSchema.parse(request.params)

  try {
    const searchCreditsProjectionUseCase = makeSearchCreditsProjectionUseCase()
    const data = await searchCreditsProjectionUseCase.execute({
      organizationId,
      date: '',
      bankId: undefined,
      isSamePersonTransfer: false,
    })

    return reply.status(200).send(data)
  } catch (err) {
    console.error(
      'Erro na busca de credits-projection por organizationId:',
      err,
    )

    // Se for erro de validação do Zod, retornar erro 400
    if (err instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de consulta inválidos',
        details: err.errors,
      })
    }

    return reply.status(500).send({
      error: 'Erro interno do servidor na busca de credits-projection',
      message: err instanceof Error ? err.message : 'Erro desconhecido',
    })
  }
}
