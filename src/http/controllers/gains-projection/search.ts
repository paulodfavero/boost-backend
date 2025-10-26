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
    return reply.status(409).send({ message: err })
  }
}
