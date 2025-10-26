import { GainsProjectionRepository } from '@/repositories/gains-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GainProjectionType {
  organizationId: string
  transactionId: string
}

export class DeleteGainsProjectionUseCase {
  constructor(
    private gainsProjectionRepository: GainsProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: GainProjectionType): Promise<object> {
    const { organizationId, transactionId } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.gainsProjectionRepository.delete(transactionId)

    return response
  }
}

