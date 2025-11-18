import { FastifyRequest, FastifyReply } from 'fastify'
import { getCustomerSubscriptions } from '../../../service/stripe'

interface GetCustomerSubscriptionsParams {
  customerId: string
}

export async function getCustomerSubscriptionsController(
  request: FastifyRequest<{
    Params: GetCustomerSubscriptionsParams
  }>,
  reply: FastifyReply,
) {
  try {
    const { customerId } = request.params

    if (!customerId) {
      return reply.status(400).send({
        error: 'Customer ID é obrigatório',
      })
    }

    const subscriptions = await getCustomerSubscriptions(customerId)

    return reply.send({
      data: subscriptions,
    })
  } catch (error: any) {
    console.error('Erro ao obter assinaturas do cliente:', error)
    return reply.status(400).send({
      error: error.message || 'Erro ao obter assinaturas do cliente',
    })
  }
}
