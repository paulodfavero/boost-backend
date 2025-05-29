import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetOrganizationUseCase } from '@/use-cases/factories/make-get-organization-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchBanksQuerySchema = z.object({
    id: z.string(),
  })

  const { id } = searchBanksQuerySchema.parse(request.params)
  const searchOrganizationId = makeGetOrganizationUseCase()

  const data = await searchOrganizationId.execute({
    id,
  })

  return reply.status(200).send(data)
}
