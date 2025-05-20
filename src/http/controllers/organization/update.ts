import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateOrganizationUseCase } from '@/use-cases/factories/make-update-organization-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateOrganizationParamsSchema = z.object({
    organizationId: z.string(),
  })

  const updateOrganiaztionBodySchema = z.object({
    stripeCustomerId: z.string(),    
  })

  const { organizationId } = updateOrganizationParamsSchema.parse(request.params)

  const reqBody = updateOrganiaztionBodySchema.parse(request.body)
  const updateOrganizationUseCase = makeUpdateOrganizationUseCase()

  const data = await updateOrganizationUseCase.execute({
    organizationId,
    reqBody,
  })

  return reply.status(201).send(data)
}
