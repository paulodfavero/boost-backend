import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteBankUseCase } from '@/use-cases/factories/make-delete-bank-use-case'

export async function deleteBank(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteCheckInParamsSchema = z.object({
    organizationId: z.string(),
  })
  const deleteBodySchema = z.object({
    bankId: z.string(),
  })
  
  const { organizationId } = deleteCheckInParamsSchema.parse(request.params)
  const { bankId } = deleteBodySchema.parse(request.body)

  const deleteBankUseCase = makeDeleteBankUseCase()
  const data = await deleteBankUseCase.execute({
    organizationId,
    bankId,
  })

  return reply.status(201).send(data)
}
