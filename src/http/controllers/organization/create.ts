import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateOrganizationUseCase } from '@/use-cases/factories/make-create-organization-use-case'
import { makeCreateUserUseCase } from '@/use-cases/factories/make-create-user-use-case'
import { makeCreateAccessLogUseCase } from '@/use-cases/factories/make-create-access-log-use-case'
import { parseUserAgent, getClientIp } from '@/lib/device-info'
// import { OrganizationAlreadyExistsError } from '@/use-cases/errors/organization-already-exist'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createOrganizationBodySchema = z.object({
    name: z.string(),
    email: z.string(),
    image: z.string().nullish(),
    password: z.string().nullish(),
  })

  const { name, email, image, password } = createOrganizationBodySchema.parse(
    request.body,
  )
  try {
    const createOrganizationUseCase = makeCreateOrganizationUseCase()
    const createUserUseCase = makeCreateUserUseCase()

    const data = await createOrganizationUseCase.execute({
      name,
      email,
      password: password || undefined,
      image: image || undefined,
    })
    if (!data) throw new Error()
    const { organizationId, created } = data

    // Extract device information from request (for both new and existing organizations)
    const userAgent = request.headers['user-agent']
    const ipAddress = getClientIp(request)

    // Debug logs for production
    console.log('🔍 CREATE DEBUG - User Agent:', userAgent)
    console.log('🔍 CREATE DEBUG - IP Address:', ipAddress)

    // Skip logging for axios requests to avoid duplication
    if (userAgent && userAgent.includes('axios')) {
      console.log('🔍 CREATE DEBUG - Skipping axios request')
      // Don't create log for axios requests
    } else {
      let deviceInfo = {
        deviceType: 'unknown',
        browser: 'unknown',
        os: 'unknown',
        platform: 'web',
      }
      if (userAgent) {
        deviceInfo = parseUserAgent(userAgent)
        console.log(
          '🔍 CREATE DEBUG - Parsed Device Info:',
          JSON.stringify(deviceInfo, null, 2),
        )
      }

      // Create access log for both new and existing organizations (browser requests only)
      const createAccessLogUseCase = makeCreateAccessLogUseCase()
      const accessLogResult = await createAccessLogUseCase.execute({
        organizationId,
        userAgent,
        ipAddress,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        platform: deviceInfo.platform,
      })

      console.log(
        '🔍 CREATE DEBUG - Access Log Created:',
        JSON.stringify(accessLogResult.accessLog, null, 2),
      )
    }

    if (created) return reply.status(201).send(data)
    await createUserUseCase.execute({
      name,
      email,
      image: image || undefined,
      organizationId,
    })
    return reply.status(201).send(data)
  } catch (err) {
    // if (err instanceof OrganizationAlreadyExistsError) {
    return reply.status(501).send({
      message: `❌ ERROR ${err}`,
    })
    // }
    // throw err
  }
}
