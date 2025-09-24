import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeValidateIAPPurchaseUseCase } from '@/use-cases/factories/make-validate-iap-purchase-use-case'
import { makeCreateAccessLogUseCase } from '@/use-cases/factories/make-create-access-log-use-case'
import { parseUserAgent, getClientIp } from '@/lib/device-info'
import { invalidateCache } from '@/http/middlewares/cache'

export async function validateIAPPurchase(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const validateIAPPurchaseParamsSchema = z.object({
    organizationId: z.string(),
  })

  const validateIAPPurchaseBodySchema = z.object({
    productId: z.string(),
    transactionId: z.string(),
    transactionReceipt: z.string(),
    plan: z.string(),
    transactionDate: z.number(),
  })

  try {
    console.log('=== VALIDATE IAP PURCHASE - INÍCIO ===')
    console.log('Request params:', request.params)
    console.log('Request body:', request.body)
    console.log('Request headers:', {
      'user-agent': request.headers['user-agent'],
      'content-type': request.headers['content-type'],
      authorization: request.headers.authorization ? 'present' : 'missing',
    })

    const { organizationId } = validateIAPPurchaseParamsSchema.parse(
      request.params,
    )
    const {
      productId,
      transactionId,
      transactionReceipt,
      plan,
      transactionDate,
    } = validateIAPPurchaseBodySchema.parse(request.body)

    console.log('Dados validados:', {
      organizationId,
      productId,
      transactionId,
      plan,
      transactionDate,
      transactionReceiptLength: transactionReceipt?.length || 0,
    })

    const validateIAPPurchaseUseCase = makeValidateIAPPurchaseUseCase()

    const result = await validateIAPPurchaseUseCase.execute({
      productId,
      transactionId,
      transactionReceipt,
      plan,
      transactionDate,
      organizationId,
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
        platform: 'mobile',
      }
      if (userAgent) {
        deviceInfo = parseUserAgent(userAgent)
      }

      // Create access log for IAP validation (only for browser requests)
      const createAccessLogUseCase = makeCreateAccessLogUseCase()
      await createAccessLogUseCase.execute({
        organizationId,
        userAgent,
        ipAddress,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        platform: deviceInfo.platform,
      })
    }

    // Invalidar cache de organizações após atualização
    invalidateCache('organizations')

    console.log('Resultado da validação IAP:', result)
    console.log('=== VALIDATE IAP PURCHASE - FIM ===')

    if (result.success) {
      return reply.status(200).send(result)
    } else {
      return reply.status(400).send(result)
    }
  } catch (error) {
    console.error('Erro no controller validate-iap-purchase:', error)

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      })
    }

    return reply.status(500).send({
      success: false,
      error: 'Erro interno do servidor',
    })
  }
}
