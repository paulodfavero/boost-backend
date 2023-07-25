import { GainsRepository } from '@/repositories/gain-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GainType {
  organizationId: string
  transactionId: string
}

export class DeleteGainUseCase {
  constructor(
    private gainsRepository: GainsRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: GainType): Promise<object> {
    const { organizationId, transactionId } = data
    console.log(
      '%cdelete-gain.ts line:23 data',
      'color: #007acc;',
      transactionId,
    )

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.gainsRepository.delete(transactionId)

    return response
  }
}
