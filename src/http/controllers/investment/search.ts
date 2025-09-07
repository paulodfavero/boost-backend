import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchInvestmentsUseCase } from '@/use-cases/factories/make-search-investments-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchInvestmentsParamsSchema = z.object({
    organizationId: z.string(),
  })

  const { organizationId } = searchInvestmentsParamsSchema.parse(request.params)

  const searchInvestmentsUseCase = makeSearchInvestmentsUseCase()

  const data = await searchInvestmentsUseCase.execute({
    organizationId,
  })

  return reply.status(200).send(data)
}
