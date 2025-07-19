import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface OrganizationRepository {
  stripeCustomerId: string
}

export interface OrganizationType {
  organizationId: string
  reqBody: OrganizationRepository
}

export class UpdateOrganizationUseCase {
  constructor(
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: OrganizationType): Promise<object> {
    const { organizationId, reqBody } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const {
      stripeCustomerId
    } = reqBody

    const dataReturn = {
      stripeCustomerId,
      organizationId
    }

    const response = await this.organizationsRepository.update(dataReturn)

    return response
  }
}
