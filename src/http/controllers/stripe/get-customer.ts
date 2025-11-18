import { FastifyRequest, FastifyReply } from 'fastify'
import { getCustomerById } from '../../../service/stripe'

interface GetCustomerParams {
  customerId: string
}

export async function getCustomer(
  request: FastifyRequest<{ Params: GetCustomerParams }>,
  reply: FastifyReply,
) {
  try {
    const { customerId } = request.params

    if (!customerId) {
      return reply.status(400).send({
        error: 'Customer ID é obrigatório',
      })
    }

    const customer = await getCustomerById(customerId)

    return reply.send(customer)
  } catch (error: any) {
    console.error('Erro ao obter cliente do Stripe:', error)
    return reply.status(400).send({
      error: error.message || 'Erro ao obter cliente do Stripe',
    })
  }
}
