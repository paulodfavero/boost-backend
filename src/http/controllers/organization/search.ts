import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeGetOrganizationUseCase } from '@/use-cases/factories/make-get-organization-use-case'
import { makeGetOrganizationByEmailUseCase } from '@/use-cases/factories/make-get-organization-by-email-use-case'

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

export async function searchByEmail(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchByEmailQuerySchema = z.object({
    email: z.string().email(),
  })

  const { email } = searchByEmailQuerySchema.parse(request.params)
  const getOrganizationByEmailUseCase = makeGetOrganizationByEmailUseCase()

  const data = await getOrganizationByEmailUseCase.execute({
    email,
  })

  return reply.status(200).send(data)
}

export async function searchMany(request: FastifyRequest, reply: FastifyReply) {
  const searchOrganizationsQuerySchema = z.object({
    date: z.string().optional(),
  })
  const { date } = searchOrganizationsQuerySchema.parse(request.query)
  const searchOrganizationsUseCase =
    require('@/use-cases/factories/make-search-organizations-use-case').makeSearchOrganizationsUseCase()
  const data = await searchOrganizationsUseCase.execute({ date })
  return reply.status(200).send(data)
}
