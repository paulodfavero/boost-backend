import { prisma } from '@/lib/prisma'
import {
  BanksRepository,
  BanksTypeAccountRepository,
  CreateBankTypeAccountUseCaseResponse,
} from '../bank-repository'
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
    const bankTypeAccount = await prisma.bank.findUnique({
      where: {
        id,
      },
    })

    return bankTypeAccount
  }

  async findByOrganizationId(organizationId: string) {
    const bankTypeAccount = await prisma.bank.findMany({
      where: {
        organizationId,
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

  async update(data: CreateBankUseCaseResponse) {
    const bank = await prisma.bank.update({
      data,
      where: {
        item_id: data.item_id,
      },
    } as any)

    return bank
  }

  async delete(bankId: string) {
    const credit = await prisma.bank.delete({
      where: {
        id: bankId,
      },
    })

    return credit
  }

  async updateNameAlias(data: {
    bankId: string
    nameAlias?: string
    lastUpdatedAt?: string
  }) {
    const updateData: any = {}

    if (data.nameAlias !== undefined) {
      updateData.name_alias = data.nameAlias
    }

    if (data.lastUpdatedAt) {
      updateData.last_updated_at = data.lastUpdatedAt
    }

    const bank = await prisma.bank.update({
      where: {
        id: data.bankId,
      },
      data: updateData,
    })

    return bank
  }

  async deleteManyByOrganization(organizationId: string) {
    const result = await prisma.bank.deleteMany({
      where: {
        organizationId,
      },
    })

    return result
  }
}
export class PrismaBankTypeAccountRepository
  implements BanksTypeAccountRepository
{
  async findByAccountId(accountId: string) {
    const bankTypeAccount = await prisma.bankTypeAccount.findUnique({
      where: {
        account_id: accountId,
      },
    })

    return bankTypeAccount
  }

  async findByItemId(itemId: string) {
    const bankTypeAccount = await prisma.bankTypeAccount.findMany({
      where: {
        item_id: itemId,
      },
    })

    return bankTypeAccount
  }

  async findByOrganizationId(organizationId: string) {
    const bankTypeAccount = await prisma.bankTypeAccount.findMany({
      where: {
        organizationId,
      },
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
    const bankTypeAccount = await prisma.bankTypeAccount.create({
      data,
    } as any)

    return bankTypeAccount
  }

  async updateByAccountId(data: CreateBankTypeAccountUseCaseResponse) {
    const bankTypeAccount = await prisma.bankTypeAccount.update({
      where: {
        id: data.id,
      },
      data,
    } as any)

    return bankTypeAccount
  }

  async deleteMany(bankItemId: string) {
    const gain = await prisma.bankTypeAccount.deleteMany({
      where: {
        item_id: bankItemId,
      },
    })

    return gain
  }

  async updateNameAlias(data: {
    bankTypeAccountId: string
    nameAlias?: string
    balance_close_date_week_day?: string
    balance_due_date_week_day?: string
  }) {
    const bankTypeAccount = await prisma.bankTypeAccount.update({
      where: {
        id: data.bankTypeAccountId,
      },
      data: {
        name_alias: data.nameAlias,
        balance_close_date_week_day: data.balance_close_date_week_day,
        balance_due_date_week_day: data.balance_due_date_week_day,
      } as any,
    })

    return bankTypeAccount
  }

  async deleteManyByOrganization(organizationId: string) {
    const result = await prisma.bankTypeAccount.deleteMany({
      where: {
        organizationId,
      },
    })

    return result
  }
}
