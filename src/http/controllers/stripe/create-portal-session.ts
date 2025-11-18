import { FastifyRequest, FastifyReply } from 'fastify'
import Stripe from 'stripe'
import { env } from '../../../env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

interface CreatePortalSessionQuery {
  stripeCustomerId?: string
}

export async function createPortalSession(
  request: FastifyRequest<{ Querystring: CreatePortalSessionQuery }>,
  reply: FastifyReply,
) {
  try {
    const { stripeCustomerId } = request.query

    // Validação: Customer ID obrigatório
    if (!stripeCustomerId) {
      return reply.status(400).send({
        error: 'Customer ID é obrigatório',
      })
    }

    // Obter origin da requisição (para return_url)
    const origin =
      request.headers.origin ||
      request.headers.referer ||
      env.SITE_URL ||
      'https://app.boostfinance.com.br'

    // Criar sessão do portal de cobrança
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/plans`,
    })

    // Retornar URL do portal
    return reply.status(200).send({ url: session.url })
  } catch (error: any) {
    console.error('Erro ao criar sessão do portal:', error)

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
