import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeUpdateGoalUseCase } from '@/use-cases/factories/make-update-goal-use-case'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateGoalParamsSchema = z.object({
    goalId: z.string(),
  })

  const updateGoalBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().optional(),
    currentAmount: z.number().optional(),
    period: z.string().optional(),
    initiationDate: z.string().optional(),
  })

  const { goalId } = updateGoalParamsSchema.parse(request.params)
  const data = updateGoalBodySchema.parse(request.body)

  try {
    const updateGoalUseCase = makeUpdateGoalUseCase()
    const goal = await updateGoalUseCase.execute({
      id: goalId,
      ...data,
    })

    return reply.status(200).send(goal)
  } catch (err) {
    return reply.status(404).send({
      message: `❌ ERROR ${err}`,
    })
  }
}
