import { FastifyRequest, FastifyReply } from 'fastify'
import Stripe from 'stripe'
import { env } from '../../../env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

interface CheckSessionRequest {
  sessionId: string
}

export async function checkSession(
  request: FastifyRequest<{ Body: CheckSessionRequest }>,
  reply: FastifyReply,
) {
  try {
    const { sessionId } = request.body

    // Validate required fields
    if (!sessionId) {
      return reply.status(400).send({
        error: 'sessionId é obrigatório',
      })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return reply.status(200).send({ session })
  } catch (error) {
    console.error('Erro no endpoint check-session:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return reply.status(400).send({
        error: error.message,
        type: error.type,
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}
