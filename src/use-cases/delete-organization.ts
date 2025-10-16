import { OrganizationsRepository } from '@/repositories/organization-repository'
import {
  BanksRepository,
  BanksTypeAccountRepository,
} from '@/repositories/bank-repository'
import { CategoriesRepository } from '@/repositories/category-repository'
import { CompaniesRepository } from '@/repositories/company-repository'
import { CreditsRepository } from '@/repositories/credit-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { GainsRepository } from '@/repositories/gain-repository'
import { GoalsRepository } from '@/repositories/goals-repository'
import { SuggestionsRepository } from '@/repositories/suggestion-repository'
import { UsersRepository } from '@/repositories/user-repository'
import { InvestmentRepository } from '@/repositories/investment-repository'
import { AccessLogRepository } from '@/repositories/access-log-repository'
import { OrganizationNotFound } from './errors/organization-not-found-error'

interface DeleteOrganizationType {
  organizationId: string
}

export class DeleteOrganizationUseCase {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private banksRepository: BanksRepository,
    private banksTypeAccountRepository: BanksTypeAccountRepository,
    private categoriesRepository: CategoriesRepository,
    private companiesRepository: CompaniesRepository,
    private creditsRepository: CreditsRepository,
    private expensesRepository: ExpensesRepository,
    private gainsRepository: GainsRepository,
    private goalsRepository: GoalsRepository,
    private suggestionsRepository: SuggestionsRepository,
    private usersRepository: UsersRepository,
    private investmentsRepository: InvestmentRepository,
    private accessLogsRepository: AccessLogRepository,
  ) {}

  async execute(data: DeleteOrganizationType): Promise<object> {
    const { organizationId } = data

    // Verificar se a organização existe
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )

    if (!organization) {
      throw new OrganizationNotFound()
    }

    // Deletar todas as dependências em ordem (respeitando foreign keys)

    // 1. Deletar transações financeiras (expenses, gains, credits)
    await this.expensesRepository.deleteManyByOrganization(organizationId)
    await this.gainsRepository.deleteManyByOrganization(organizationId)
    await this.creditsRepository.deleteManyByOrganization(organizationId)

    // 2. Deletar investimentos
    await this.investmentsRepository.deleteManyByOrganization(organizationId)

    // 3. Deletar metas
    await this.goalsRepository.deleteManyByOrganization(organizationId)

    // 4. Deletar sugestões
    await this.suggestionsRepository.deleteManyByOrganization(organizationId)

    // 5. Deletar categorias
    await this.categoriesRepository.deleteManyByOrganization(organizationId)

    // 6. Deletar empresas
    await this.companiesRepository.deleteManyByOrganization(organizationId)

    // 7. Deletar contas bancárias (BankTypeAccount)
    await this.banksTypeAccountRepository.deleteManyByOrganization(
      organizationId,
    )

    // 8. Deletar bancos
    await this.banksRepository.deleteManyByOrganization(organizationId)

    // 9. Deletar logs de acesso
    await this.accessLogsRepository.deleteManyByOrganization(organizationId)

    // 10. Deletar usuários (isso também deleta Account e Session por cascade)
    await this.usersRepository.deleteManyByOrganization(organizationId)

    // 11. Finalmente, deletar a organização
    const response = await this.organizationsRepository.delete(organizationId)

    return response
  }
}
