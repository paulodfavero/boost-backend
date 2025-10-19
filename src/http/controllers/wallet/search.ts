import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchWalletsUseCase } from '@/use-cases/factories/make-search-wallets-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchWalletsParamsSchema = z.object({
    organizationId: z.string(),
  })

  const { organizationId } = searchWalletsParamsSchema.parse(request.params)

  const searchWalletsUseCase = makeSearchWalletsUseCase()

  const data = await searchWalletsUseCase.execute({
    organizationId,
  })

  return reply.status(200).send(data)
}
