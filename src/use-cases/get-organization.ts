import { Organization } from '@prisma/client'

import { OrganizationsRepository } from '@/repositories/organization-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GetOrganizationUseCaseRequest {
  id: string
}
interface GetOrganizationUseCaseResponse {
  createdAt: Date
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
    console.log(
      '%csrc/use-cases/get-organization.ts:18 id',
      'color: #007acc;',
      id,
    )
    const organization = (await this.organizationsRepository.findById(
      id,
    )) as Organization
    console.log(
      '%csrc/use-cases/get-organization.ts:22 organization',
      'color: #007acc;',
      organization,
    )
    if (!organization) {
      throw new OrganizationNotFound()
    }
    return {
      createdAt: organization.created_at,
      name: organization.name,
      cnpj: organization.cnpj,
      cpf: organization.cpf,
      email: organization.email,
      stripeCustomerId: organization.stripe_customer_id,
    }
  }
}
