import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateGoalUseCase } from '@/use-cases/factories/make-create-goal-use-case'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createGoalParamsSchema = z.object({
    organizationId: z.string(),
  })

  const createGoalBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    amount: z.number(),
    currentAmount: z.number().default(0),
    initiationDate: z.string(),
    expirationDate: z.string(),
  })

  const { organizationId } = createGoalParamsSchema.parse(request.params)
  const {
    name,
    description,
    amount,
    currentAmount,
    initiationDate,
    expirationDate,
  } = createGoalBodySchema.parse(request.body)
  try {
    const createGoalUseCase = makeCreateGoalUseCase()

    const goal = await createGoalUseCase.execute({
      name,
      description,
      amount,
      currentAmount,
      initiation_date: initiationDate,
      expiration_date: expirationDate,
      organizationId,
    })

    return reply.status(201).send(goal)
  } catch (err) {
    return reply.status(501).send({
      message: err,
    })
  }
}
