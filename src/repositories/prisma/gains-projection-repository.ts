import { prisma } from '@/lib/prisma'
import { GainsProjectionRepository } from '../gains-projection-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'

interface GainProjectionUpdateRepository {
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

export class PrismaGainsProjectionRepository
  implements GainsProjectionRepository
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

    const gainsProjection = await prisma.gainsProjection.findMany({
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
      orderBy: {
        created_at: 'desc',
      },
    })

    return gainsProjection
  }

  async createMany(
    data: Prisma.Enumerable<Prisma.GainsProjectionCreateManyInput>,
  ) {
    const gainProjection = await prisma.gainsProjection.createMany({
      data,
      skipDuplicates: true,
    })

    return gainProjection
  }

  async findById(transactionId: string) {
    const gainProjection = await prisma.gainsProjection.findUnique({
      where: {
        id: transactionId,
      },
    })

    return gainProjection
  }

  async update(data: GainProjectionUpdateRepository) {
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

    const gainProjection = await prisma.gainsProjection.update({
      where: {
        id,
      },
      data: prismaData,
    })

    return gainProjection
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
    const prismaData: Prisma.GainsProjectionUpdateManyMutationInput = {}

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

    const gainProjection = await prisma.gainsProjection.updateMany({
      where: {
        group_installment_id: groupInstallmentId,
      },
      data: prismaData,
    })

    return gainProjection
  }

  async delete(transactionId: string) {
    const gainProjection = await prisma.gainsProjection.delete({
      where: {
        id: transactionId,
      },
    })

    return gainProjection
  }

  async deleteManyByGroupId(
    groupInstallmentId: string,
    organizationId: string,
  ) {
    const gainProjection = await prisma.gainsProjection.deleteMany({
      where: {
        group_installment_id: groupInstallmentId,
        organizationId,
      },
    })

    return gainProjection
  }

  async deleteMany(bankId: string) {
    const gainProjection = await prisma.gainsProjection.deleteMany({
      where: {
        bankId,
      },
    })

    return gainProjection
  }

  async deleteManyByOrganization(organizationId: string) {
    const gainProjection = await prisma.gainsProjection.deleteMany({
      where: {
        organizationId,
      },
    })

    return gainProjection
  }
}
