import { FastifyRequest, FastifyReply } from 'fastify'
import Stripe from 'stripe'
import { env } from '../../../env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

interface CheckoutSessionRequest {
  sessionId: string
}

export async function checkoutSession(
  request: FastifyRequest<{ Body: CheckoutSessionRequest }>,
  reply: FastifyReply,
) {
  try {
    const { sessionId } = request.body

    // Validação: Session ID obrigatório
    if (!sessionId) {
      return reply.status(400).send({
        error: 'Session ID é obrigatório',
      })
    }

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Retornar dados da sessão
    return reply.status(200).send({ session })
  } catch (error: any) {
    console.error('Erro ao buscar sessão do Stripe:', error)

    // Tratar erros específicos do Stripe
    if (error instanceof Stripe.errors.StripeError) {
      return reply.status(400).send({
        error: error.message,
      })
    }

    // Erro genérico
    return reply.status(500).send({
      error: 'Erro interno do servidor',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}
