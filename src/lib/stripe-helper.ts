import { getUserPlanByCustomerId } from '../service/stripe'

/**
 * Helper function to get plan type from Stripe customer ID
 * Returns 'TRIAL' if no customer ID or if there's an error
 */
export async function getPlanTypeFromStripe(
  stripeCustomerId: string | null,
): Promise<string> {
  if (!stripeCustomerId) {
    console.log('🔍 No Stripe customer ID provided, returning TRIAL plan')
    return 'TRIAL'
  }

  try {
    console.log(`🔍 Getting plan type for Stripe customer: ${stripeCustomerId}`)
    const userPlan = await getUserPlanByCustomerId(stripeCustomerId)
    console.log(`✅ Plan type retrieved: ${userPlan.planType}`)
    return userPlan.planType
  } catch (error) {
    console.error('❌ Error getting plan type from Stripe:', error)
    console.log('🔄 Falling back to TRIAL plan due to error')
    return 'TRIAL'
  }
}

/**
 * Helper function to enrich organization data with plan type from Stripe
 */
export async function enrichOrganizationWithPlanType<
  T extends { stripeCustomerId?: string | null },
>(organizationData: T): Promise<T & { planType: string }> {
  const planType = await getPlanTypeFromStripe(
    organizationData.stripeCustomerId || null,
  )

  return {
    ...organizationData,
    planType,
  }
}
