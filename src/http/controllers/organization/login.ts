import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'
import { makeCreateAccessLogUseCase } from '@/use-cases/factories/make-create-access-log-use-case'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { env } from '@/env'
import { parseUserAgent, getClientIp } from '@/lib/device-info'

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)

  try {
    const authenticateUseCase = makeAuthenticateUseCase()

    const { organization } = await authenticateUseCase.execute({
      email,
      password,
    })

    // Extract device information from request
    const userAgent = request.headers['user-agent']
    const ipAddress = getClientIp(request)

    // Debug logs for production
    console.log('🔍 LOGIN DEBUG - User Agent:', userAgent)
    console.log('🔍 LOGIN DEBUG - IP Address:', ipAddress)

    // Skip logging for axios requests to avoid duplication
    if (userAgent && userAgent.includes('axios')) {
      console.log('🔍 LOGIN DEBUG - Skipping axios request')
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
          '🔍 LOGIN DEBUG - Parsed Device Info:',
          JSON.stringify(deviceInfo, null, 2),
        )
      }

      // Create access log only for browser requests
      const createAccessLogUseCase = makeCreateAccessLogUseCase()
      const accessLogResult = await createAccessLogUseCase.execute({
        organizationId: organization.id,
        userAgent,
        ipAddress,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        platform: deviceInfo.platform,
      })

      console.log(
        '🔍 LOGIN DEBUG - Access Log Created:',
        JSON.stringify(accessLogResult.accessLog, null, 2),
      )
    }

    const token = jwt.sign(
      {
        sub: organization.id,
      },
      env.JWT_SECRET,
      {
        expiresIn: '7d',
      },
    )

    return reply.status(200).send({
      token,
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email,
        image: organization.image,
      },
    })
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: err.message })
    }

    throw err
  }
}
