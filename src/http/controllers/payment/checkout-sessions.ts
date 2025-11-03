import { FastifyRequest, FastifyReply } from 'fastify'
import Stripe from 'stripe'
import { env } from '../../../env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

interface CheckoutSessionRequest {
  email: string
  priceId: string
  organizationId: string
  origin: string
}

export async function createCheckoutSession(
  request: FastifyRequest<{ Body: CheckoutSessionRequest }>,
  reply: FastifyReply,
) {
  try {
    const { email, priceId, organizationId, origin } = request.body

    // Validate required fields
    if (!email || !priceId) {
      return reply.status(400).send({
        error: 'E-mail e priceId são obrigatórios',
      })
    }

    // Ensure origin has a valid scheme
    let validOrigin = origin
    if (!validOrigin) {
      validOrigin = env.SITE_URL
    }
    const isAnnualPlan =
      priceId === process.env.STRIPE_ESSENCIAL_PLAN_ID_ANNUAL ||
      priceId === process.env.STRIPE_PLUS_PLAN_ID_ANNUAL ||
      priceId === process.env.STRIPE_PRO_PLAN_ID_ANNUAL

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // discounts: [
      //   {
      //     coupon: '{{COUPON_ID}}',
      //   },
      // ],
      allow_promotion_codes: !isAnnualPlan, // Permitir cupons apenas para planos mensais
      locale: 'pt-BR',
      success_url: `${validOrigin}/plans/success?sessionId={CHECKOUT_SESSION_ID}&organizationId=${organizationId}`,
      cancel_url: `${validOrigin}/plans?canceled=true`,
    })

    if (session.url) {
      return reply.status(200).send({
        url: session.url,
        sessionId: session.id,
      })
    } else {
      return reply.status(500).send({
        error: 'Session URL is null',
      })
    }
  } catch (error) {
    console.error('Erro no endpoint checkout-sessions:', error)

    if (error instanceof Stripe.errors.StripeError) {
      return reply.status(400).send({
        error: error.message,
        type: error.type,
        code: error.code,
      })
    }

    return reply.status(500).send({
      error: 'Internal server error',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}
