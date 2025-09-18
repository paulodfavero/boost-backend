import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateBankUseCase } from '@/use-cases/factories/make-update-bank-use-case'
import { invalidateCache } from '@/http/middlewares/cache'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateBankParamsSchema = z.object({
    bankId: z.string(),
    organizationId: z.string(),
  })

  const updateBankBodySchema = z.object({
    nameAlias: z.string().optional(),
  })

  const { bankId, organizationId } = updateBankParamsSchema.parse(
    request.params,
  )
  const { nameAlias } = updateBankBodySchema.parse(request.body)

  const updateBankUseCase = makeUpdateBankUseCase()

  const data = await updateBankUseCase.execute({
    bankId,
    organizationId,
    nameAlias,
  })

  // Invalidar cache de bancos após atualização
  invalidateCache('banks')

  return reply.status(200).send(data)
}
