import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteBillUseCase } from '@/use-cases/factories/make-delete-bill-use-case'

export async function deleteBill(request: FastifyRequest, reply: FastifyReply) {
  const deleteBillParamsSchema = z.object({
    billId: z.string(),
  })

  const { billId } = deleteBillParamsSchema.parse(request.params)

  const deleteBillUseCase = makeDeleteBillUseCase()

  await deleteBillUseCase.execute({
    billId,
  })

  return reply.status(204).send()
}
