import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'
import { getPlanTypeFromStripe } from '../lib/stripe-helper'

// Aceita qualquer campo da Organization exceto id e created_at
interface UpdateOrganizationData {
  organizationId: string
  data: Partial<
    Omit<import('@prisma/client').Organization, 'id' | 'created_at'>
  >
}

export class UpdateOrganizationUseCase {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute(data: UpdateOrganizationData): Promise<object> {
    const { organizationId, data: updateData } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.organizationsRepository.update({
      organizationId,
      data: updateData,
    })

    // Get plan type from Stripe and add to response
    const planType = await getPlanTypeFromStripe(
      organization.stripe_customer_id,
    )

    return {
      ...response,
      planType,
    }
  }
}
