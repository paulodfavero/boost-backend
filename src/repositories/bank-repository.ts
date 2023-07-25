import { Bank, Prisma } from '@prisma/client'
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
export interface BanksRepository {
  searchMany(query: string): Promise<Bank[]>
  create(data: CreateBankUseCaseResponse): Promise<Bank>
}
