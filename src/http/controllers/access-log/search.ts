import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaAccessLogRepository } from '@/repositories/access-log-repository'

export async function searchAccessLogs(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchParamsSchema = z.object({
    organizationId: z.string(),
  })

  const { organizationId } = searchParamsSchema.parse(request.params)

  const accessLogRepository = new PrismaAccessLogRepository()
  const accessLogs = await accessLogRepository.findByOrganizationId(
    organizationId,
  )

  return reply.status(200).send({
    accessLogs: accessLogs.map((log) => ({
      id: log.id,
      created_at: log.created_at,
      updated_at: log.updated_at,
      organizationId: log.organizationId,
      user_agent: log.user_agent,
      ip_address: log.ip_address,
      device_type: log.device_type,
      browser: log.browser,
      os: log.os,
      location: log.location,
    })),
  })
}
