import { prisma } from '@/lib/prisma'
import { CreditsRepository } from '../credit-repository'
import { Prisma, Credit, Bank } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'

type CreditWithBank = Credit & {
  bank: Bank | null
}

interface CreditUpdateRepository {
  id: string
  expirationDate?: string | Date
  description?: string
  company?: string
  category?: string
  amount?: number
  typePayment?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean
  organizationId: string
}

export class PrismaCreditRepository implements CreditsRepository {
  async searchMany(
    organizationId: string,
    date?: string,
    bankId?: string,
    monthStart?: string,
    monthEnd?: string,
  ): Promise<CreditWithBank[]> {
    const startOfTheDay = date
      ? dayjs(date).startOf('date').toDate()
      : dayjs(monthStart).startOf('date').toDate()
    const endOfTheDay = date
      ? lastDayOfMonth(startOfTheDay)
      : lastDayOfMonth(dayjs(monthEnd).startOf('date').toDate())

    const credits = await prisma.credit.findMany({
      where: {
        organizationId: {
          contains: organizationId,
        },
        ...(bankId && {
          bankId: {
            contains: bankId,
          },
        }),
        expiration_date: {
          gte: startOfTheDay.toISOString(),
          lte: endOfTheDay.toISOString(),
        },
      },
      include: {
        bank: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return credits
  }

  async createMany(data: Prisma.Enumerable<Prisma.CreditCreateManyInput>) {
    const credit = await prisma.credit.createMany({
      data,
      skipDuplicates: true,
    })

    return credit
  }

  async update(data: CreditUpdateRepository) {
    const credit = await prisma.credit.update({
      where: {
        id: data.id,
      },
      data,
    })

    return credit
  }

  async delete(transactionId: string) {
    const credit = await prisma.credit.delete({
      where: {
        id: transactionId,
      },
    })

    return credit
  }

  async deleteMany(bankId: string) {
    const credit = await prisma.credit.deleteMany({
      where: {
        bankId,
      },
    })

    return credit
  }

  async searchCardList(organizationId: string) {
    const credits = await prisma.credit.findMany({
      where: {
        organizationId: {
          contains: organizationId,
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return credits
  }
}
