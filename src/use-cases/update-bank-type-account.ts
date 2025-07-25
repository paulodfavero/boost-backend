import { BanksTypeAccountRepository } from '@/repositories/bank-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import {
  OrganizationNotFound,
  BankNotFound,
} from './errors/organization-not-found-error'

interface UpdateBankTypeAccountUseCaseRequest {
  bankTypeAccountId: string
  organizationId: string
  nameAlias?: string
}

export class UpdateBankTypeAccountUseCase {
  constructor(
    private bankTypeAccountRepository: BanksTypeAccountRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({
    bankTypeAccountId,
    organizationId,
    nameAlias,
  }: UpdateBankTypeAccountUseCaseRequest): Promise<object> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const bankTypeAccount = await this.bankTypeAccountRepository.findById(
      bankTypeAccountId,
    )
    if (!bankTypeAccount) throw new BankNotFound()

    const response = await this.bankTypeAccountRepository.updateNameAlias({
      bankTypeAccountId,
      nameAlias,
    })

    return response
  }
}
