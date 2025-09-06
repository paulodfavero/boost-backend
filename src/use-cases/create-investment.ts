import { InvestmentRepository } from '@/repositories/investment-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'

interface CreateInvestmentUseCaseRequest {
  investments: string
  organizationId: string
  bankId?: string
}

interface InvestmentResponse {
  id: string
  created_at: Date
  updated_at: Date | null
  investments: string
  organizationId: string
  bankId: string | null
}

export class CreateInvestmentUseCase {
  constructor(
    private investmentRepository: InvestmentRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({
    investments,
    organizationId,
    bankId,
  }: CreateInvestmentUseCaseRequest): Promise<InvestmentResponse> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    // Se bankId foi fornecido, verificar se já existe um investment para este banco
    if (bankId) {
      const existingInvestment = await this.investmentRepository.findByBankId(
        bankId,
      )
      if (existingInvestment) {
        // Só fazer update se o novo investments.length for maior que o existente
        if (investments.length > existingInvestment.investments.length) {
          const updatedInvestment = await this.investmentRepository.update(
            existingInvestment.id,
            {
              investments,
            },
          )
          return updatedInvestment
        }
        // Se não for maior, retornar o investment existente sem alteração
        return existingInvestment
      }
    }

    // Se não existe investment para o bankId ou bankId não foi fornecido, criar novo
    const investment = await this.investmentRepository.create({
      investments,
      organizationId,
      bankId,
    })

    return investment
  }
}
