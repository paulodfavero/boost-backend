import { FastifyRequest, FastifyReply } from 'fastify'
import Stripe from 'stripe'
import { env } from '../../../env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

// Função para identificar se um priceId é de plano mensal
async function isMonthlyPlan(priceId: string): Promise<boolean> {
  try {
    // Buscar o price no Stripe para verificar o intervalo de cobrança
    const price = await stripe.prices.retrieve(priceId)

    // Verificar se é um plano de assinatura recorrente
    if (price.type === 'recurring') {
      // Se o intervalo for 'month', é mensal
      return price.recurring?.interval === 'month'
    }

    // Se não for recorrente, não é um plano de assinatura válido
    return false
  } catch (error) {
    console.error('Erro ao verificar price no Stripe:', error)

    // Fallback: usar lista de planos mensais conhecidos
    const monthlyPlanIds = [
      env.STRIPE_PRO_PLAN_ID,
      env.STRIPE_PLUS_PLAN_ID,
      env.STRIPE_ESSENCIAL_PLAN_ID,
      env.STRIPE_PRO_PLAN_ID_OLD,
      env.STRIPE_PLUS_PLAN_ID_OLD,
    ].filter(Boolean)

    const annualPlanIds = [
      env.STRIPE_PRO_PLAN_ID_ANNUAL,
      env.STRIPE_PLUS_PLAN_ID_ANNUAL,
      env.STRIPE_ESSENCIAL_PLAN_ID_ANNUAL,
    ].filter(Boolean)

    // Se for um plano anual conhecido, definitivamente não é mensal
    if (annualPlanIds.includes(priceId)) {
      return false
    }

    // Se for um plano mensal conhecido, retorna true
    return monthlyPlanIds.includes(priceId)
  }
}

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

    // Verificar se é um plano mensal para permitir cupons
    const isMonthly = await isMonthlyPlan(priceId)

    // Log para debug
    console.log(`🔍 PriceId recebido: ${priceId}`)
    console.log(`🔍 É plano mensal: ${isMonthly}`)

    // Se NÃO for plano mensal, retornar erro imediatamente
    if (!isMonthly) {
      return reply.status(400).send({
        error:
          'Cupons de desconto são válidos apenas para planos mensais. Para planos anuais, você já possui um desconto especial.',
      })
    }

    // Ensure origin has a valid scheme
    let validOrigin = origin
    if (!validOrigin) {
      validOrigin = env.SITE_URL
    }
    console.log('allow_promotion_codes', false)
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
      allow_promotion_codes: false, // Permitir cupons apenas para planos mensais
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
