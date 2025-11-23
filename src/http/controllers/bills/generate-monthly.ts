import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGenerateMonthlyBillsUseCase } from '@/use-cases/factories/make-generate-monthly-bills-use-case'

export async function generateMonthly(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const generateMonthlyBillsParamsSchema = z.object({
    organizationId: z.string(),
  })

  const generateMonthlyBillsQuerySchema = z.object({
    targetMonth: z.string().optional(), // Formato: 'YYYY-MM'
  })

  const { organizationId } = generateMonthlyBillsParamsSchema.parse(
    request.params,
  )
  const { targetMonth } = generateMonthlyBillsQuerySchema.parse(request.query)

  const generateMonthlyBillsUseCase = makeGenerateMonthlyBillsUseCase()

  const data = await generateMonthlyBillsUseCase.execute({
    organizationId,
    targetMonth,
  })

  return reply.status(200).send(data)
}
