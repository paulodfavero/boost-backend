import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface CreditProjectionType {
  organizationId: string
  transactionId: string
}

export class DeleteCreditsProjectionUseCase {
  constructor(
    private creditsProjectionRepository: CreditsProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreditProjectionType): Promise<object> {
    const { organizationId, transactionId } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.creditsProjectionRepository.delete(
      transactionId,
    )

    return response
  }
}
