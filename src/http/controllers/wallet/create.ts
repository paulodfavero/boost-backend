import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateWalletUseCase } from '@/use-cases/factories/make-create-wallet-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createWalletParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createWalletBodySchema = z.object({
    name: z.string(),
    balance: z.number().optional().default(0),
  })

  const { organizationId } = createWalletParamsSchema.parse(request.params)
  const { name, balance } = createWalletBodySchema.parse(request.body)

  const createWalletUseCase = makeCreateWalletUseCase()

  const data = await createWalletUseCase.execute({
    name,
    balance,
    organizationId,
  })

  return reply.status(201).send(data)
}
