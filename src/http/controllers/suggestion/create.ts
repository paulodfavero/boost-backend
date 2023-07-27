import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateSuggestionUseCase } from '@/use-cases/factories/make-create-suggestion-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createSuggestionParamsSchema = z.object({
    organizationId: z.string(),
  })
  const createSuggestionBodySchema = z.object({
    amountByMonth: z.number(),
    isUseful: z.boolean(),
    message: z.string().nullish(),
  })
  const { organizationId } = createSuggestionParamsSchema.parse(request.params)

  const { amountByMonth, isUseful, message } = createSuggestionBodySchema.parse(
    request.body,
  )
  console.log('%ccreate.ts line:15 aqui', 'color: #007acc;')
  const createSuggestionUseCase = makeCreateSuggestionUseCase()

  const data = await createSuggestionUseCase.execute({
    amountByMonth,
    isUseful,
    message: message || undefined,
    organizationId,
  })

  return reply.status(201).send(data)
}
