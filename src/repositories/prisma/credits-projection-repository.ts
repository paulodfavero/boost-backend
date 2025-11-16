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
  isHidden: boolean
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
  isHidden?: boolean
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

  async findById(transactionId: string) {
    const creditProjection = await prisma.creditsProjection.findUnique({
      where: {
        id: transactionId,
      },
    })

    return creditProjection
  }

  async update(data: CreditProjectionUpdateRepository) {
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
    if (
      expirationDate !== undefined &&
      expirationDate !== null &&
      expirationDate !== ''
    ) {
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

    const creditProjection = await prisma.creditsProjection.update({
      where: {
        id,
      },
      data: prismaData,
    })

    return creditProjection
  }

  async updateManyByGroupId(
    groupInstallmentId: string,
    data: {
      description?: string | null
      category?: string | null
      amount?: number | null
      paid?: boolean | null
      isHidden?: boolean | null
      company?: string | null
      type_payment?: string | null
      installment_total_payment?: number | null
      organizationId?: string
    },
  ) {
    // Map values for Prisma updateMany (only include defined, non-null values)
    const prismaData: Prisma.CreditsProjectionUpdateManyMutationInput = {}

    if (data.description !== undefined && data.description !== null) {
      prismaData.description = data.description
    }
    if (data.category !== undefined && data.category !== null) {
      prismaData.category = data.category
    }
    if (data.amount !== undefined && data.amount !== null) {
      prismaData.amount = data.amount
    }
    if (data.paid !== undefined && data.paid !== null) {
      prismaData.paid = data.paid
    }
    if (data.isHidden !== undefined && data.isHidden !== null) {
      prismaData.isHidden = data.isHidden
    }
    if (data.company !== undefined && data.company !== null) {
      prismaData.company = data.company
    }
    if (data.type_payment !== undefined && data.type_payment !== null) {
      prismaData.type_payment = data.type_payment
    }
    if (
      data.installment_total_payment !== undefined &&
      data.installment_total_payment !== null
    ) {
      prismaData.installment_total_payment = data.installment_total_payment
    }

    const creditProjection = await prisma.creditsProjection.updateMany({
      where: {
        group_installment_id: groupInstallmentId,
      },
      data: prismaData,
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

  async deleteManyByGroupId(
    groupInstallmentId: string,
    organizationId: string,
  ) {
    const creditProjection = await prisma.creditsProjection.deleteMany({
      where: {
        group_installment_id: groupInstallmentId,
        organizationId,
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
