import { CompaniesRepository } from '@/repositories/company-repository'

interface SearchCompanyUseCaseRequest {
  query: string
  organizationId: string
}

export class SearchCompanyUseCase {
  constructor(private companiesRepository: CompaniesRepository) {}

  async execute({ query }: SearchCompanyUseCaseRequest): Promise<object> {
    const companies = await this.companiesRepository.searchMany(query)

    return {
      companies,
    }
  }
}
