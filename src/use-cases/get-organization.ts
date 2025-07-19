import { Organization } from '@prisma/client'

import { OrganizationsRepository } from '@/repositories/organization-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GetOrganizationUseCaseRequest {
  id: string
}
interface GetOrganizationUseCaseResponse {
  createdAt: Date
  updatedAt?: Date | null
  name: string
  cnpj?: string | null
  cpf?: string | null
  email: string | null
  stripeCustomerId: string | null
}

export class GetOrganizationUseCase {
  constructor(private organizationsRepository: OrganizationsRepository) {}

  async execute({
    id,
  }: GetOrganizationUseCaseRequest): Promise<GetOrganizationUseCaseResponse> {
    const organization = (await this.organizationsRepository.findById(
      id,
    )) as Organization

    if (!organization) {
      throw new OrganizationNotFound()
    }
    return {
      createdAt: organization.created_at,
      updatedAt: organization.updated_at,
      name: organization.name,
      cnpj: organization.cnpj,
      cpf: organization.cpf,
      email: organization.email,
      stripeCustomerId: organization.stripe_customer_id,
    }
  }
}
