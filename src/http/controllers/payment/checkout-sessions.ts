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

    // Log URLs para debug
    const successUrl = `${validOrigin}/plans/success?sessionId={CHECKOUT_SESSION_ID}&organizationId=${organizationId}`
    const cancelUrl = `${validOrigin}/plans?canceled=true`

    console.log('🔗 Creating checkout session with URLs:')
    console.log('  Success URL:', successUrl)
    console.log('  Cancel URL:', cancelUrl)
    console.log('  Origin:', validOrigin)

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
      allow_promotion_codes: true,
      locale: 'pt-BR',
      success_url: successUrl,
      cancel_url: cancelUrl,
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
      console.error('Stripe Error Details:', {
        type: error.type,
        code: error.code,
        message: error.message,
        doc_url: error.doc_url,
      })

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
