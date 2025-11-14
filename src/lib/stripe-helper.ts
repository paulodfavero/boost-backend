import { getUserPlanByCustomerId } from '../service/stripe'

/**
 * Helper function to get plan type from Stripe customer ID or Apple IAP
 * Returns 'TRIAL' if no customer ID or if there's an error
 */
export async function getPlanTypeFromStripe(
  stripeCustomerId: string | null,
  organizationData?: {
    plan?: string
    apple_iap_transaction_id?: string | null
  },
): Promise<string> {
  if (organizationData?.apple_iap_transaction_id && organizationData?.plan) {
    return organizationData.plan
  }

  if (!stripeCustomerId) {
    return 'TRIAL'
  }

  try {
    const userPlan = await getUserPlanByCustomerId(stripeCustomerId)
    return userPlan.planType
  } catch (error) {
    console.error('❌ Error getting plan type from Stripe:', error)
    return 'TRIAL'
  }
}

/**
 * Helper function to enrich organization data with plan type from Stripe
 */
export async function enrichOrganizationWithPlanType<
  T extends {
    stripeCustomerId?: string | null
    plan?: string
    apple_iap_transaction_id?: string | null
  },
>(organizationData: T): Promise<T & { planType: string }> {
  const planType = await getPlanTypeFromStripe(
    organizationData.stripeCustomerId || null,
    {
      plan: organizationData.plan,
      apple_iap_transaction_id: organizationData.apple_iap_transaction_id,
    },
  )

  return {
    ...organizationData,
    planType,
  }
}
