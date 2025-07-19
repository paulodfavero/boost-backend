import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateOrganizationUseCase } from '@/use-cases/factories/make-update-organization-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateOrganizationParamsSchema = z.object({
    organizationId: z.string(),
  })

  // Permite qualquer campo no body
  const updateOrganizationBodySchema = z.record(z.any())

  const { organizationId } = updateOrganizationParamsSchema.parse(
    request.params,
  )

  const data = updateOrganizationBodySchema.parse(request.body)
  const updateOrganizationUseCase = makeUpdateOrganizationUseCase()

  const result = await updateOrganizationUseCase.execute({
    organizationId,
    data,
  })

  return reply.status(201).send(result)
}
