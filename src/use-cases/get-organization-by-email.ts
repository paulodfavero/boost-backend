import { OrganizationsRepository } from '@/repositories/organization-repository'
import { getPlanTypeFromStripe } from '@/lib/stripe-helper'

interface GetOrganizationByEmailUseCaseRequest {
  email: string
}

interface GetOrganizationByEmailUseCaseResponse {
  id: string
  createdAt: Date
  updatedAt: Date | null
  name: string
  cnpj?: string | null
  cpf?: string | null
  email: string | null
  stripeCustomerId?: string | null
  appleIapTransactionId?: string | null
  plan: string
  planType: string
  trialEnd?: Date | null
}

export class GetOrganizationByEmailUseCase {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute({
    email,
  }: GetOrganizationByEmailUseCaseRequest): Promise<GetOrganizationByEmailUseCaseResponse> {
    const organization = await this.organizationsRepository.findByEmail(email)

    if (!organization) {
      throw new Error('Conta não encontrada')
    }

    // Get plan type from Stripe or IAP
    const planType = await getPlanTypeFromStripe(
      organization.stripe_customer_id,
      {
        plan: organization.plan,
        apple_iap_transaction_id: organization.apple_iap_transaction_id,
      },
    )

    return {
      id: organization.id,
      createdAt: organization.created_at,
      updatedAt: organization.updated_at,
      name: organization.name,
      cnpj: organization.cnpj,
      cpf: organization.cpf,
      email: organization.email,
      stripeCustomerId: organization.stripe_customer_id,
      appleIapTransactionId: organization.apple_iap_transaction_id,
      plan: organization.plan,
      planType,
      trialEnd: organization.trial_end,
    }
  }
}
