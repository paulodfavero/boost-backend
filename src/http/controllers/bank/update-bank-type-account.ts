import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateBankTypeAccountUseCase } from '@/use-cases/factories/make-update-bank-type-account-use-case'

export async function updateBankTypeAccount(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateBankTypeAccountParamsSchema = z.object({
    bankTypeAccountId: z.string(),
    organizationId: z.string(),
  })

  const updateBankTypeAccountBodySchema = z.object({
    nameAlias: z.string().optional(),
    balance_close_date_week_day: z.string().optional(),
    balance_due_date_week_day: z.string().optional(),
  })

  const { bankTypeAccountId, organizationId } =
    updateBankTypeAccountParamsSchema.parse(request.params)
  const { nameAlias, balance_close_date_week_day, balance_due_date_week_day } =
    updateBankTypeAccountBodySchema.parse(request.body)

  const updateBankTypeAccountUseCase = makeUpdateBankTypeAccountUseCase()

  const data = await updateBankTypeAccountUseCase.execute({
    bankTypeAccountId,
    organizationId,
    nameAlias,
    balance_close_date_week_day,
    balance_due_date_week_day,
  })

  return reply.status(200).send(data)
}
