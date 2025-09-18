import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateOrganizationUseCase } from '@/use-cases/factories/make-update-organization-use-case'
import { makeCreateAccessLogUseCase } from '@/use-cases/factories/make-create-access-log-use-case'
import { parseUserAgent, getClientIp } from '@/lib/device-info'
import { invalidateCache } from '@/http/middlewares/cache'

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

  // Extract device information from request
  const userAgent = request.headers['user-agent']
  const ipAddress = getClientIp(request)

  // Skip logging for axios requests to avoid duplication
  if (userAgent && userAgent.includes('axios')) {
    // Don't create log for axios requests
  } else {
    let deviceInfo = {
      deviceType: 'unknown',
      browser: 'unknown',
      os: 'unknown',
    }
    if (userAgent) {
      deviceInfo = parseUserAgent(userAgent)
    }

    // Create access log for organization update (only for browser requests)
    const createAccessLogUseCase = makeCreateAccessLogUseCase()
    await createAccessLogUseCase.execute({
      organizationId,
      userAgent,
      ipAddress,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    })
  }

  // Invalidar cache de organizações após atualização
  invalidateCache('organizations')

  return reply.status(201).send(result)
}
