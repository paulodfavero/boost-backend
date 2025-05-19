import { OrganizationsRepository } from '@/repositories/organization-repository'
import { BanksRepository, BanksTypeAccountRepository } from '@/repositories/bank-repository'
import { BankNotFound, OrganizationNotFound } from './errors/organization-not-found-error'
import { Bank, BankTypeAccount, Prisma } from '@prisma/client'

interface CreateBankUseCaseResponse {
  itemId: string
  name: string
  primaryColor: string
  institutionUrl: string
  type: string
  imageUrl: string
  hasMFA: boolean
  products?: Prisma.BankCreateproductsInput | undefined
  status: string
  lastUpdatedAt: string | Date
  organizationId: string
}
export interface CreateBankTypeAccountUseCase {
  type: string
  subtype: string
  name: string
  accountId: string
  owner: string
  marketingName: string
  balance: number
  currencyCode: string
  itemId: string
  number: string
  lastUpdatedAt?: Date
  bankData?: string
  creditData?: string
  taxNumber?: string
  organizationId: string
}

export class CreateBankUseCase {
  constructor(
    private categoriesRepository: BanksRepository,
    private organizationsRepository: OrganizationsRepository,
  ) { }

  async execute({
    name,
    itemId,
    primaryColor,
    institutionUrl,
    type,
    imageUrl,
    hasMFA,
    products,
    status,
    lastUpdatedAt,
    organizationId,
  }: CreateBankUseCaseResponse): Promise<Bank> {
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.categoriesRepository.create({
      name,
      item_id: itemId,
      primary_color: primaryColor,
      institution_url: institutionUrl,
      type,
      image_url: imageUrl,
      has_mfa: hasMFA,
      products,
      status,
      last_updated_at: lastUpdatedAt,
      organizationId,
    })
    const { id } = response
    return {
      id,
      name,
      itemId,
      primaryColor,
      institutionUrl,
      type,
      imageUrl,
      hasMFA,
      products,
      status,
      lastUpdatedAt,
      organizationId,
    }
  }
}
export class CreateBankTypeAccountUseCase {
  constructor(
    private bankTypeAccountRepository: BanksTypeAccountRepository,
    private bankRepository: BanksRepository,
    private organizationsRepository: OrganizationsRepository,
  ) { }

  async execute({
    type,
    subtype,
    name,
    accountId,
    owner,
    marketingName,
    itemId,
    balance,
    currencyCode,
    number,
    bankData,
    creditData,
    taxNumber,
    organizationId,
  }: CreateBankTypeAccountUseCase): Promise<any> {
    const bank = await this.bankRepository.findByItemId(
      itemId,
    )
    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()
    if (!bank) throw new BankNotFound()

    const response = await this.bankTypeAccountRepository.create({
      type,
      subtype,
      name,
      account_id: accountId,
      owner,
      marketing_name: marketingName,
      item_id: itemId,
      balance,
      currency_code: currencyCode,
      number,
      bank_data: bankData,
      credit_data: creditData,
      tax_number: taxNumber,
    })

    const { id } = response
    return {
      id,
      itemId,
      type,
      subtype,
      name,
      accountId,
      marketingName,
      owner,
      balance,
      currencyCode,
      number,
      bankData: bankData ?? '',
      creditData: creditData ?? '',
      taxNumber,
    }
  }
}
