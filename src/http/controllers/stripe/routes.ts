import { FastifyInstance } from 'fastify'
import { getCustomer } from './get-customer'
import { getCustomerSubscriptionsController } from './get-customer-subscriptions'
import { getActiveSubscriptionController } from './get-active-subscription'
import { getUserPlan } from './get-user-plan'
import { checkoutSession } from './checkout-session'
import { createPortalSession } from './create-portal-session'

export async function stripeRoutes(app: FastifyInstance) {
  // GET /stripe/customer/:customerId - Obtém informações do cliente
  app.get('/stripe/customer/:customerId', getCustomer)

  // GET /stripe/customer/:customerId/subscriptions - Obtém todas as assinaturas
  app.get(
    '/stripe/customer/:customerId/subscriptions',
    getCustomerSubscriptionsController,
  )

  // GET /stripe/customer/:customerId/active-subscription - Obtém assinatura ativa
  app.get(
    '/stripe/customer/:customerId/active-subscription',
    getActiveSubscriptionController,
  )

  // GET /stripe/customer/:customerId/plan - Obtém plano completo do usuário
  app.get('/stripe/customer/:customerId/plan', getUserPlan)

  // POST /stripe/checkout-session - Verifica e retorna dados da sessão de checkout
  app.post('/stripe/checkout-session', checkoutSession)

  // POST /stripe/create-portal-session - Cria uma sessão do portal de cobrança do Stripe
  app.post('/stripe/create-portal-session', createPortalSession)
}
