import { prisma } from '@/lib/prisma'
import { ExpensesRepository } from '../expense-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { lastDayOfMonth } from 'date-fns'

dayjs.extend(utc)

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

export class PrismaExpenseRepositoryTimezoneFixed
  implements ExpensesRepository
{
  async searchMany(
    organizationId: string,
    date?: string,
    bankId?: string,
    monthStart?: string,
    monthEnd?: string,
  ) {
    const startOfTheDay = date
      ? dayjs.utc(date).startOf('day').toDate()
      : dayjs.utc(monthStart).startOf('day').toDate()

    const endOfTheDay = date
      ? dayjs(lastDayOfMonth(startOfTheDay)).endOf('date').toDate()
      : dayjs(lastDayOfMonth(dayjs.utc(monthEnd).startOf('day').toDate()))
          .endOf('date')
          .toDate()

    // Construir a query com tratamento de timezone
    const whereClause = {
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
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
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

  async deleteMany(bankId: string) {
    const expense = await prisma.expense.deleteMany({
      where: {
        bankId,
      },
    })

    return expense
  }
}
