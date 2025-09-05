import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateInvestmentUseCase } from '@/use-cases/factories/make-create-investment-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createInvestmentParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createInvestmentBodySchema = z.object({
    investments: z.string(),
    bankId: z.string().optional(),
  })

  const { organizationId } = createInvestmentParamsSchema.parse(request.params)
  const { investments, bankId } = createInvestmentBodySchema.parse(request.body)

  const createInvestmentUseCase = makeCreateInvestmentUseCase()

  const data = await createInvestmentUseCase.execute({
    investments,
    organizationId,
    bankId,
  })

  return reply.status(201).send(data)
}
