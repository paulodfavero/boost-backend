import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteOrganizationUseCase } from '@/use-cases/factories/make-delete-organization-use-case'

export async function deleteOrganization(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteOrganizationParamsSchema = z.object({
    organizationId: z.string(),
  })

  const { organizationId } = deleteOrganizationParamsSchema.parse(
    request.params,
  )

  const deleteOrganizationUseCase = makeDeleteOrganizationUseCase()

  try {
    const data = await deleteOrganizationUseCase.execute({
      organizationId,
    })

    return reply.status(200).send({
      message: 'Organization deleted successfully',
      data,
    })
  } catch (error) {
    return reply.status(400).send({
      message: 'Failed to delete organization',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
