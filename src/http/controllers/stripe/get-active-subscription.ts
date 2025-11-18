import { FastifyRequest, FastifyReply } from 'fastify'
import { getActiveSubscription } from '../../../service/stripe'

interface GetActiveSubscriptionParams {
  customerId: string
}

export async function getActiveSubscriptionController(
  request: FastifyRequest<{ Params: GetActiveSubscriptionParams }>,
  reply: FastifyReply,
) {
  try {
    const { customerId } = request.params

    if (!customerId) {
      return reply.status(400).send({
        error: 'Customer ID é obrigatório',
      })
    }

    const subscription = await getActiveSubscription(customerId)

    return reply.send(subscription)
  } catch (error: any) {
    console.error('Erro ao obter assinatura ativa:', error)
    return reply.status(400).send({
      error: error.message || 'Erro ao obter assinatura ativa',
    })
  }
}
