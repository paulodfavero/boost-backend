import { BanksRepository } from '@/repositories/bank-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import {
  OrganizationNotFound,
  BankNotFound,
} from './errors/organization-not-found-error'

interface UpdateBankUseCaseRequest {
  bankId: string
  organizationId: string
  nameAlias?: string
}

export class UpdateBankUseCase {
  constructor(
    private banksRepository: BanksRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute({
    bankId,
    organizationId,
    nameAlias,
  }: UpdateBankUseCaseRequest): Promise<object> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const bank = await this.banksRepository.findById(bankId)
    if (!bank) throw new BankNotFound()

    const response = await this.banksRepository.updateNameAlias({
      bankId,
      nameAlias,
    })

    return response
  }
}
