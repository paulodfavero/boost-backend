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
    return reply.status(409).send({ message: err })
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
    return reply.status(409).send({ message: err })
  }
}
