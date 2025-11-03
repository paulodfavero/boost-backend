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

  async update(data: ExpenseProjectionUpdateRepository) {
    const expenseProjection = await prisma.expensesProjection.update({
      where: {
        id: data.id,
      },
      data,
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



