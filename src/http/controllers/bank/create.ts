import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateBankUseCase } from '@/use-cases/factories/make-create-bank-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createBankParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createBankBodySchema = z.object({
    name: z.string(),
    itemId: z.string(),
    primaryColor: z.string(),
    institutionUrl: z.string(),
    type: z.string(),
    imageUrl: z.string(),
    hasMFA: z.boolean(),
    products: z.array(z.string().nullish()),
    status: z.string(),
    lastUpdatedAt: z.string(),
  })
  const { organizationId } = createBankParamsSchema.parse(request.params)

  const {
    name,
    itemId,
    primaryColor,
    institutionUrl,
    type,
    imageUrl,
    hasMFA,
    products,
    status,
    lastUpdatedAt,
  } = createBankBodySchema.parse(request.body)
  const createBankUseCase = makeCreateBankUseCase()

  const data = await createBankUseCase.execute({
    name,
    itemId,
    primaryColor,
    institutionUrl,
    type,
    imageUrl,
    hasMFA,
    products,
    status,
    lastUpdatedAt,
    organizationId,
  })

  return reply.status(201).send(data)
}
