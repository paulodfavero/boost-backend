import { prisma } from '@/lib/prisma'
import { BanksRepository } from '../bank-repository'
import { Prisma } from '@prisma/client'

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

export class PrismaBanksRepository implements BanksRepository {
  async searchMany(query: string) {
    const banks = await prisma.bank.findMany({
      where: {
        organizationId: query,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return banks
  }

  async create(data: CreateBankUseCaseResponse) {
    const bank = await prisma.bank.create({
      data,
    })

    return bank
  }
}
