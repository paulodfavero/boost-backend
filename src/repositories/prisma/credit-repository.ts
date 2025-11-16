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
  isHidden?: boolean
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
      ? dayjs(lastDayOfMonth(startOfTheDay)).endOf('date').toDate()
      : dayjs(lastDayOfMonth(dayjs(monthEnd).startOf('date').toDate()))
          .endOf('date')
          .toDate()

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
          gte: startOfTheDay,
          lte: endOfTheDay,
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
    const {
      id,
      expirationDate,
      typePayment,
      installmentCurrent,
      installmentTotalPayment,
      isHidden,
      ...updateData
    } = data

    // Converte string de data para Date se necessário
    let expirationDateFormatted: Date | undefined
    if (expirationDate !== undefined && expirationDate !== null) {
      if (typeof expirationDate === 'string') {
        // Formato DD/MM/YYYY
        if (expirationDate.includes('/')) {
          const [day, month, year] = expirationDate.split('/')
          expirationDateFormatted = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
          )
        } else {
          expirationDateFormatted = new Date(expirationDate)
        }
      } else if (expirationDate instanceof Date) {
        expirationDateFormatted = expirationDate
      }
    }

    const prismaData = {
      ...updateData,
      ...(expirationDateFormatted !== undefined && {
        expiration_date: expirationDateFormatted,
      }),
      ...(typePayment !== undefined && { type_payment: typePayment }),
      ...(installmentCurrent !== undefined && {
        installment_current: installmentCurrent,
      }),
      ...(installmentTotalPayment !== undefined && {
        installment_total_payment: installmentTotalPayment,
      }),
      ...(isHidden !== undefined && { isHidden }),
    }

    const credit = await prisma.credit.update({
      where: {
        id,
      },
      data: prismaData,
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

  async deleteManyByOrganization(organizationId: string) {
    const credit = await prisma.credit.deleteMany({
      where: {
        organizationId,
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
