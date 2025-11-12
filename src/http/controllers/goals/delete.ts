import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeDeleteGoalUseCase } from '@/use-cases/factories/make-delete-goal-use-case'

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const deleteGoalParamsSchema = z.object({
    goalId: z.string(),
  })

  const { goalId } = deleteGoalParamsSchema.parse(request.params)

  try {
    const deleteGoalUseCase = makeDeleteGoalUseCase()
    await deleteGoalUseCase.execute({ id: goalId })

    return reply.status(204).send()
  } catch (err) {
    return reply.status(404).send({
      message: err,
    })
  }
}
