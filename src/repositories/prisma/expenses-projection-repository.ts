import { prisma } from '@/lib/prisma'
import { ExpensesProjectionRepository } from '../expenses-projection-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'

interface ExpenseProjectionUpdateRepository {
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

export class PrismaExpensesProjectionRepository
  implements ExpensesProjectionRepository
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

    const expensesProjection = await prisma.expensesProjection.findMany({
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
        expiration_date: 'desc',
      },
    })

    return expensesProjection
  }

  async createMany(
    data: Prisma.Enumerable<Prisma.ExpensesProjectionCreateManyInput>,
  ) {
    const expenseProjection = await prisma.expensesProjection.createMany({
      data,
      skipDuplicates: true,
    })

    return expenseProjection
  }

  async findById(transactionId: string) {
    const expenseProjection = await prisma.expensesProjection.findUnique({
      where: {
        id: transactionId,
      },
    })

    return expenseProjection
  }

  async update(data: ExpenseProjectionUpdateRepository) {
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

    const expenseProjection = await prisma.expensesProjection.update({
      where: {
        id,
      },
      data: prismaData,
    })

    return expenseProjection
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
    },
  ) {
    // Map values for Prisma updateMany (only include defined, non-null values)
    const prismaData: Prisma.ExpensesProjectionUpdateManyMutationInput = {}

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

    const expenseProjection = await prisma.expensesProjection.updateMany({
      where: {
        group_installment_id: groupInstallmentId,
      },
      data: prismaData,
    })

    return expenseProjection
  }

  async delete(transactionId: string) {
    const expenseProjection = await prisma.expensesProjection.delete({
      where: {
        id: transactionId,
      },
    })

    return expenseProjection
  }

  async deleteManyByGroupId(
    groupInstallmentId: string,
    organizationId: string,
  ) {
    const expenseProjection = await prisma.expensesProjection.deleteMany({
      where: {
        group_installment_id: groupInstallmentId,
        organizationId,
      },
    })

    return expenseProjection
  }

  async deleteMany(bankId: string) {
    const expenseProjection = await prisma.expensesProjection.deleteMany({
      where: {
        bankId,
      },
    })

    return expenseProjection
  }

  async deleteManyByOrganization(organizationId: string) {
    const expenseProjection = await prisma.expensesProjection.deleteMany({
      where: {
        organizationId,
      },
    })

    return expenseProjection
  }
}
