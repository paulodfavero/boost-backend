import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteWalletUseCase } from '@/use-cases/factories/make-delete-wallet-use-case'

export async function deleteWallet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteWalletParamsSchema = z.object({
    walletId: z.string(),
  })

  const { walletId } = deleteWalletParamsSchema.parse(request.params)

  const deleteWalletUseCase = makeDeleteWalletUseCase()

  const data = await deleteWalletUseCase.execute({
    walletId,
  })

  return reply.status(200).send(data)
}
