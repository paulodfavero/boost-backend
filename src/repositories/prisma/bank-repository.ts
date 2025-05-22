import { prisma } from '@/lib/prisma'
import { BanksRepository, BanksTypeAccountRepository, CreateBankTypeAccountUseCaseResponse } from '../bank-repository'
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
  async findByItemId(query: string) {
    const bank = await prisma.bank.findUnique({
      where: {
        item_id: query,
      },      
    })
    return bank
  }

  async findById(id: string) {
    console.log('%csrc/repositories/prisma/bank-repository.ts:52 id', 'color: #007acc;', id);
    const bankTypeAccount = await prisma.bank.findUnique({
      where: {
        id,
      },
    })

    return bankTypeAccount
  }  

  async create(data: CreateBankUseCaseResponse) {
    const bank = await prisma.bank.create({
      data,
    } as any)

    return bank
  }
}
export class PrismaBankTypeAccountRepository implements BanksTypeAccountRepository {
  async findByAccountId(accountId: string) {
    const bankTypeAccount = await prisma.bankTypeAccount.findUnique({
      where: {
        account_id: accountId,
      },
    })

    return bankTypeAccount
  }
  async findByOrganizationId(organizationId: string) {
    const bankTypeAccount = await prisma.bankTypeAccount.findMany({
      where: {
        organizationId,
      }
    })

    return bankTypeAccount
  }
  async findById(id: string) {
    const bankTypeAccount = await prisma.bankTypeAccount.findUnique({
      where: {
        id,
      },
    })

    return bankTypeAccount
  }

  async create(data: CreateBankTypeAccountUseCaseResponse) {
    data.bankItemId = data.item_id
    const bankTypeAccount = await prisma.bankTypeAccount.create({
      data,
    } as any)

    return bankTypeAccount
  }
}
