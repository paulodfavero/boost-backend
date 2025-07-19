import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

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

    return response
  }
}
