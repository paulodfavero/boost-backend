import { CreditsRepository } from '@/repositories/credit-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface CreditType {
  organizationId: string
  transactionId: string
}

export class DeleteCreditUseCase {
  constructor(
    private creditsRepository: CreditsRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreditType): Promise<object> {
    const { organizationId, transactionId } = data
    console.log(
      '%cdelete-credit.ts line:23 data',
      'color: #007acc;',
      transactionId,
    )

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.creditsRepository.delete(transactionId)

    return response
  }
}
