import { prisma } from '@/lib/prisma'
import { ExpensesRepository } from '../expense-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'
type MerchantType = {
  businessName?: string | undefined
  cnae?: string | undefined
  name?: string | undefined
  cnpj?: string | undefined
}
interface ExpenseUpdateRepository {
  id: string
  expirationDate?: string | Date
  description?: string
  company?: string
  category?: string
  amount?: number
  typePayment?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  groupInstallmentId?: string
  paid?: boolean
  organizationId: string
  merchant?: MerchantType
  bankId?: string
}

export class PrismaExpenseRepository implements ExpensesRepository {
  async searchMany(organizationId: string, date: string) {
    const startOfTheDay = dayjs(date).startOf('date').toDate()
    const endOfTheDay = lastDayOfMonth(startOfTheDay)

    const expenses = await prisma.expense.findMany({
      where: {
        organizationId: {
          contains: organizationId,
        },
        expiration_date: {
          gte: startOfTheDay,
          lte: endOfTheDay,
        },
      },
      orderBy: {
        expiration_date: 'desc',
      },
    })

    return expenses
  }

  async createMany(data: Prisma.Enumerable<Prisma.ExpenseCreateManyInput>) {
    const expense = await prisma.expense.createMany({
      data,
      skipDuplicates: true,
    })

    return expense
  }

  async update(data: ExpenseUpdateRepository) {
    const expense = await prisma.expense.update({
      where: {
        id: data.id,
      },
      data,
    })

    return expense
  }

  async delete(transactionId: string) {
    const expense = await prisma.expense.delete({
      where: {
        id: transactionId,
      },
    })

    return expense
  }
}
