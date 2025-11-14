import { prisma } from '@/lib/prisma'
import { CreditsProjectionRepository } from '../credits-projection-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'

type CreditsProjectionWithBank = {
  id: string
  created_at: Date
  expiration_date: Date
  purchase_date: Date | null
  balance_close_date: Date | null
  bank_transaction_id: string | null
  description: string
  company: string
  category: string | null
  amount: number
  type_payment: string
  operation_type: string | null
  payment_data: string | null
  installment_current: number | null
  installment_total_payment: number | null
  paid: boolean
  group_installment_id: string | null
  organizationId: string
  bankId: string | null
  bankTypeAccountId: string | null
  bank?: { name: string; name_alias?: string } | null
}

interface CreditProjectionUpdateRepository {
  id: string
  expirationDate?: string | Date
  description?: string
  company?: string
  category?: string
  amount?: number
  typePayment?: string
  operationType?: string
  paymentData?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean
  organizationId: string
  bankId?: string
}

export class PrismaCreditsProjectionRepository
  implements CreditsProjectionRepository
{
  async searchMany(
    organizationId: string,
    date?: string,
    bankId?: string,
    monthStart?: string,
    monthEnd?: string,
  ) {
    const startOfTheDay = date
      ? dayjs(date).startOf('date').toDate()
      : dayjs(monthStart).startOf('date').toDate()
    const endOfTheDay = date
      ? dayjs(lastDayOfMonth(startOfTheDay)).endOf('date').toDate()
      : dayjs(lastDayOfMonth(dayjs(monthEnd).startOf('date').toDate()))
          .endOf('date')
          .toDate()

    const creditsProjection = await prisma.creditsProjection.findMany({
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
        bank: {
          select: {
            name: true,
            name_alias: true,
          },
        },
      },
      orderBy: {
        expiration_date: 'desc',
      },
    })

    return creditsProjection as CreditsProjectionWithBank[]
  }

  async searchCardList(organizationId: string) {
    const creditsProjection = await prisma.creditsProjection.findMany({
      where: {
        organizationId: {
          contains: organizationId,
        },
      },
      orderBy: {
        expiration_date: 'desc',
      },
    })

    return creditsProjection
  }

  async createMany(
    data: Prisma.Enumerable<Prisma.CreditsProjectionCreateManyInput>,
  ) {
    const creditProjection = await prisma.creditsProjection.createMany({
      data,
      skipDuplicates: true,
    })

    return creditProjection
  }

  async update(data: CreditProjectionUpdateRepository) {
    const creditProjection = await prisma.creditsProjection.update({
      where: {
        id: data.id,
      },
      data,
    })

    return creditProjection
  }

  async delete(transactionId: string) {
    const creditProjection = await prisma.creditsProjection.delete({
      where: {
        id: transactionId,
      },
    })

    return creditProjection
  }

  async deleteMany(bankId: string) {
    const creditProjection = await prisma.creditsProjection.deleteMany({
      where: {
        bankId,
      },
    })

    return creditProjection
  }

  async deleteManyByOrganization(organizationId: string) {
    const creditProjection = await prisma.creditsProjection.deleteMany({
      where: {
        organizationId,
      },
    })

    return creditProjection
  }
}





