import { FastifyRequest, FastifyReply } from 'fastify'
import Stripe from 'stripe'
import { env } from '../../../env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

interface PaymentSheetRequest {
  customer_email: string
  organizationId: string
  amount: number
  currency?: string
  description?: string
}

export async function createPaymentSheet(
  request: FastifyRequest<{ Body: PaymentSheetRequest }>,
  reply: FastifyReply,
) {
  try {
    const {
      customer_email,
      organizationId,
      amount,
      currency = 'brl',
      description = 'Pagamento Boost Finance',
    } = request.body

    // Validate required fields
    if (!customer_email || !organizationId || !amount) {
      return reply.status(400).send({
        error:
          'Missing required fields: customer_email, organizationId, and amount are required',
      })
    }

    // Validate amount (must be positive)
    if (amount <= 0) {
      return reply.status(400).send({
        error: 'Amount must be greater than 0',
      })
    }

    // 1. Create or retrieve Customer
    const customer = await stripe.customers.create({
      email: customer_email,
      metadata: { organizationId },
    })

    // 2. Create Ephemeral Key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2025-07-30.basil' },
    )

    // 3. Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.id,
      amount,
      currency,
      description,
      metadata: { organizationId },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return reply.status(200).send({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    })
  } catch (error) {
    console.error('Erro no endpoint payment-sheet:', error)

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
