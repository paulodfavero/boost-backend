import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeSearchGoalUseCase } from '@/use-cases/factories/make-search-goal-use-case'

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const searchGoalParamsSchema = z.object({
    organizationId: z.string(),
  })

  const { organizationId } = searchGoalParamsSchema.parse(request.params)

  try {
    const searchGoalUseCase = makeSearchGoalUseCase()
    const goals = await searchGoalUseCase.execute({ organizationId })

    return reply.status(200).send(goals)
  } catch (err) {
    return reply.status(404).send({
      message: `❌ ERROR ${err}`,
    })
  }
}
