import { Bank, Prisma, BankTypeAccount } from '@prisma/client'
interface CreateBankUseCaseResponse {
  itemId: string
  name: string
  primaryColor: string
  institutionUrl: string
  type: string
  imageUrl: string
  hasMFA: boolean
  products?: Prisma.BankCreateproductsInput
  status: string
  lastUpdatedAt: string | Date
  organizationId: string
}
export interface CreateBankTypeAccountUseCaseResponse {
  id?: string
  type: string
  subtype: string
  name: string
  account_id: string
  owner: string
  marketing_name?: string
  balance: number
  currency_code: string
  item_id: string
  bankId: string
  number: string
  lastUpdatedAt?: Date
  bank_data?: string
  credit_data?: string
  tax_number?: string
  bank: {
    connect: {
      item_id: string
    }
  }
  organization: {
    connect: {
      id: string
    }
  }
}
export interface BanksRepository {
  findByItemId(query: string): unknown
  findById(id: string): unknown
  findByOrganizationId(organizationId: string): any
  searchMany(query: string): Promise<Bank[]>
  create(data: CreateBankUseCaseResponse): Promise<Bank>
  delete(bankId: string): Promise<object>
}
export interface BanksTypeAccountRepository {
  findByAccountId(accountId: string): unknown
  findById(id: string): unknown
  findByItemId(itemId: string): unknown
  findByOrganizationId(organizationId: string): any
  create(data: CreateBankTypeAccountUseCaseResponse): Promise<BankTypeAccount>
  updateByAccountId(
    data: CreateBankTypeAccountUseCaseResponse,
  ): Promise<BankTypeAccount>
  deleteMany(bankItemId: string): Promise<object>
}
