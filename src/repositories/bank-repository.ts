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
  type: string
  subtype: string
  name: string
  account_id: string
  owner: string
  marketing_name?: string
  balance: number
  currency_code: string
  item_id: string
  number: string
  lastUpdatedAt?: Date
  bank_data?: string
  organizationId: string
  credit_data?: string
  tax_number?: string
  bankItemId?: string
}
export interface BanksRepository {
  findByItemId(query: string): unknown
  findById(id: string): unknown
  searchMany(query: string): Promise<Bank[]>
  create(data: CreateBankUseCaseResponse): Promise<Bank>
}
export interface BanksTypeAccountRepository {
  findByAccountId(accountId: string): unknown
  findById(id: string): unknown
  findByOrganizationId(organizationId: string): unknown
  create(data: CreateBankTypeAccountUseCaseResponse): Promise<BankTypeAccount>
}
