import { FastifyRequest, FastifyReply } from 'fastify'
import { getUserPlanByCustomerId } from '../../../service/stripe'

interface GetUserPlanParams {
  customerId: string
}

export async function getUserPlan(
  request: FastifyRequest<{ Params: GetUserPlanParams }>,
  reply: FastifyReply,
) {
  try {
    const { customerId } = request.params

    if (!customerId) {
      return reply.status(400).send({
        error: 'Customer ID é obrigatório',
      })
    }

    const userPlan = await getUserPlanByCustomerId(customerId)

    return reply.send(userPlan)
  } catch (error: any) {
    console.error('Erro ao obter plano do usuário:', error)
    return reply.status(400).send({
      error: error.message || 'Erro ao obter plano do usuário',
    })
  }
}
