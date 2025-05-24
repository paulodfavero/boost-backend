import { BanksRepository, BanksTypeAccountRepository } from '@/repositories/bank-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'
import { GainsRepository } from '@/repositories/gain-repository'
import { ExpensesRepository } from '@/repositories/expense-repository'
import { CreditsRepository } from '@/repositories/credit-repository'

interface BankType {
  bankId: string
  organizationId: string
}

export class DeleteBankUseCase {
  constructor(
    private banksRepository: BanksRepository,
    private bankTypeAccountRepository: BanksTypeAccountRepository,
    private organizationsRepository: OrganizationsRepository,
    private gainsRepository: GainsRepository,
    private expensesRepository: ExpensesRepository,
    private creditsRepository: CreditsRepository,
  ) {}

  async execute(data: BankType): Promise<object> {
    const { bankId, organizationId } = data
  
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )

    /////// aqui rolam as validações
    if (!organization) throw new OrganizationNotFound()
console.log(bankId, organizationId)
    await this.gainsRepository.deleteMany(bankId)
    await this.expensesRepository.deleteMany(bankId)
    await this.creditsRepository.deleteMany(bankId)
    const bank = await this.banksRepository.findById(bankId) as  { item_id: string };
    const bankItemId = bank?.item_id || '';
    await this.bankTypeAccountRepository.deleteMany(bankItemId)

    const response = await this.banksRepository.delete(bankId)

    return response
  }
}
