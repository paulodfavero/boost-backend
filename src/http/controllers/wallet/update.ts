import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateWalletUseCase } from '@/use-cases/factories/make-update-wallet-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateWalletParamsSchema = z.object({
    walletId: z.string(),
  })
  const updateWalletBodySchema = z.object({
    name: z.string().optional(),
    balance: z.number().optional(),
  })

  const { walletId } = updateWalletParamsSchema.parse(request.params)
  const { name, balance } = updateWalletBodySchema.parse(request.body)

  const updateWalletUseCase = makeUpdateWalletUseCase()

  const data = await updateWalletUseCase.execute({
    walletId,
    name,
    balance,
  })

  return reply.status(200).send(data)
}
