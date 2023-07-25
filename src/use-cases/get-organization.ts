import { Organization } from '@prisma/client'

import { OrganizationsRepository } from '@/repositories/organization-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GetOrganizationUseCaseRequest {
  organizationId: string
}
interface GetOrganizationUseCaseResponse {
  organization: Organization
}
export class GetOrganizationUseCase {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute({
    organizationId,
  }: GetOrganizationUseCaseRequest): Promise<GetOrganizationUseCaseResponse> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    console.log(
      '%cget-organization.ts line:18 organization',
      'color: #007acc;',
      organization,
    )
    if (!organization) {
      throw new OrganizationNotFound()
    }
    return { organization }
  }
}
