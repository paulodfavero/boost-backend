import { InvestmentRepository } from '@/repositories/investment-repository'

interface SearchInvestmentsUseCaseRequest {
  organizationId: string
}

interface InvestmentResponse {
  id: string
  created_at: Date
  updated_at: Date | null
  investments: string
  organizationId: string
  bankId: string | null
}

export class SearchInvestmentsUseCase {
  constructor(private investmentRepository: InvestmentRepository) {}

  async execute({
    organizationId,
  }: SearchInvestmentsUseCaseRequest): Promise<InvestmentResponse[]> {
    const investments = await this.investmentRepository.findByOrganizationId(
      organizationId,
    )
    return investments
  }
}
