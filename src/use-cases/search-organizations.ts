import { OrganizationsRepository } from '@/repositories/organization-repository'
import { BanksRepository } from '@/repositories/bank-repository'

interface SearchOrganizationsUseCaseRequest {
  date?: string
}

export class SearchOrganizationsUseCase {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private banksRepository: BanksRepository,
  ) {}

  async execute({
    date,
  }: SearchOrganizationsUseCaseRequest = {}): Promise<object> {
    const organizations = await this.organizationsRepository.searchMany(date)
    let organizationsByMonth: Record<string, any[]> = {}
    if (Array.isArray(organizations)) {
      // Se vier array, coloca tudo em um mês genérico
      organizationsByMonth = { all: organizations }
    } else {
      organizationsByMonth = organizations
    }

    // Para cada mês, adiciona o bankCount em cada organização
    const result: Record<string, any[]> = {}
    for (const [month, orgs] of Object.entries(organizationsByMonth)) {
      result[month] = await Promise.all(
        orgs.map(async (org: any) => {
          const banks = await this.banksRepository.findByOrganizationId(org.id)
          return {
            ...org,
            bankCount: Array.isArray(banks) ? banks.length : 0,
            bankCreatedAt: Array.isArray(banks) ? banks[0]?.created_at : null,
          }
        }),
      )
    }
    return {
      organizations: result,
    }
  }
}
