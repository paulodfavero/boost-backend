import axios from 'axios'
import { env } from '../env'

const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY

// Planos do Stripe
const STRIPE_PRO_PLAN_ID = env.STRIPE_PRO_PLAN_ID
const STRIPE_PRO_PLAN_ID_OLD = env.STRIPE_PRO_PLAN_ID_OLD
const STRIPE_PRO_PLAN_ID_ANNUAL = env.STRIPE_PRO_PLAN_ID_ANNUAL
const STRIPE_PLUS_PLAN_ID = env.STRIPE_PLUS_PLAN_ID
const STRIPE_PLUS_PLAN_ID_ANNUAL = env.STRIPE_PLUS_PLAN_ID_ANNUAL
const STRIPE_PLUS_PLAN_ID_OLD = env.STRIPE_PLUS_PLAN_ID_OLD
const STRIPE_ESSENCIAL_PLAN_ID = env.STRIPE_ESSENCIAL_PLAN_ID
const STRIPE_ESSENCIAL_PLAN_ID_ANNUAL = env.STRIPE_ESSENCIAL_PLAN_ID_ANNUAL

// Verificar se a chave do Stripe está disponível
if (!STRIPE_SECRET_KEY) {
  console.warn(
    '⚠️ STRIPE_SECRET_KEY não encontrada. Funcionalidades do Stripe podem não funcionar.',
  )
}

export interface StripeSubscription {
  id: string
  customer: string
  status:
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid'
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
  plan: {
    id: string
    product: string
  }
  items: {
    data: Array<{
      id: string
      price: {
        id: string
        product: string
        unit_amount: number
        currency: string
        recurring: {
          interval: 'day' | 'week' | 'month' | 'year'
          interval_count: number
        }
      }
    }>
  }
  metadata?: Record<string, string>
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  subscriptions?: {
    data: StripeSubscription[]
  }
}

export const apiStripe = axios.create({
  baseURL: 'https://api.stripe.com/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Bearer ${STRIPE_SECRET_KEY || ''}`,
  },
})

apiStripe.interceptors.request.use(
  (config: any) => {
    return config
  },
  (error: any) => {
    console.error('❌ Stripe Request Error:', error)
    return Promise.reject(error)
  },
)

apiStripe.interceptors.response.use(
  (response: any) => {
    return response
  },
  (error: any) => {
    console.error('❌ Stripe API Error:', error)
    if (error.response && error.response.data) {
      return Promise.reject(
        new Error(
          error.response.data.error?.message || 'Erro na requisição Stripe',
        ),
      )
    }

    return Promise.reject(new Error('Erro ao fazer a requisição para Stripe'))
  },
)

/**
 * Obtém informações do cliente da Stripe pelo customer_id
 */
export const getCustomerById = async (
  customerId: string,
): Promise<StripeCustomer> => {
  try {
    const { data } = await apiStripe.get<StripeCustomer>(
      `/customers/${customerId}`,
    )
    return data
  } catch (error: any) {
    console.error('ERROR TO GET STRIPE CUSTOMER:', error)
    throw error
  }
}

/**
 * Obtém todas as assinaturas de um cliente da Stripe
 */
export const getCustomerSubscriptions = async (
  customerId: string,
): Promise<StripeSubscription[]> => {
  try {
    const { data } = await apiStripe.get<{ data: StripeSubscription[] }>(
      `/subscriptions?customer=${customerId}&limit=100`,
    )
    return data.data
  } catch (error: any) {
    console.error('ERROR TO GET STRIPE SUBSCRIPTIONS:', error)
    throw error
  }
}

/**
 * Obtém a assinatura ativa de um cliente da Stripe
 */
export const getActiveSubscription = async (
  customerId: string,
): Promise<StripeSubscription | null> => {
  try {
    const subscriptions = await getCustomerSubscriptions(customerId)
    const activeSubscription = subscriptions.find(
      (sub) => sub.status === 'active',
    )
    return activeSubscription || null
  } catch (error: any) {
    console.error('ERROR TO GET ACTIVE SUBSCRIPTION:', error)
    throw error
  }
}

/**
 * Obtém o tipo de plano baseado na assinatura da Stripe
 */
export const getPlanTypeFromSubscription = (
  subscription: StripeSubscription,
): string => {
  if (!subscription || !subscription.items?.data?.length) {
    return 'TRIAL'
  }
  const planId = subscription.plan.id

  if (
    planId === STRIPE_PRO_PLAN_ID ||
    planId === STRIPE_PRO_PLAN_ID_ANNUAL ||
    planId === STRIPE_PRO_PLAN_ID_OLD
  ) {
    return 'PRO'
  }
  if (
    planId === STRIPE_PLUS_PLAN_ID ||
    planId === STRIPE_PLUS_PLAN_ID_ANNUAL ||
    planId === STRIPE_PLUS_PLAN_ID_OLD
  ) {
    return 'PLUS'
  }
  if (
    planId === STRIPE_ESSENCIAL_PLAN_ID ||
    planId === STRIPE_ESSENCIAL_PLAN_ID_ANNUAL
  ) {
    return 'ESSENCIAL'
  }

  // Adicione mais mapeamentos conforme necessário
  return 'TRIAL'
}

/**
 * Função principal para obter o tipo de plano do usuário pelo customer_id
 */
export const getUserPlanByCustomerId = async (
  customerId: string,
): Promise<{
  planType: string
  subscription: StripeSubscription | null
  customer: StripeCustomer | null
}> => {
  try {
    // Obtém informações do cliente
    const customer = await getCustomerById(customerId)
    console.log('🔍 Customer:', customer)
    // Obtém a assinatura ativa
    const subscription = await getActiveSubscription(customerId)
    console.log('🔍 Subscription:', subscription)
    // Determina o tipo de plano
    const planType = subscription
      ? getPlanTypeFromSubscription(subscription)
      : 'TRIAL'
    return {
      planType,
      subscription,
      customer,
    }
  } catch (error: any) {
    console.error('ERROR TO GET USER PLAN BY CUSTOMER ID:', error)
    throw error
  }
}
