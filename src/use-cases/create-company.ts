import { OrganizationsRepository } from '@/repositories/organization-repository'
import { CompaniesRepository } from '@/repositories/company-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'
import { Company } from '@prisma/client'

interface CreateCompanyUseCaseResponse {
  name: string
  organizationId: string
}

export class CreateCompanyUseCase {
  constructor(
    private categoriesRepository: CompaniesRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({
    name,
    organizationId,
  }: CreateCompanyUseCaseResponse): Promise<Company> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const company = await this.categoriesRepository.create({
      name,
      organizationId,
    })

    return company
  }
}
