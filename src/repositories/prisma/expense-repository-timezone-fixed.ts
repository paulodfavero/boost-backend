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
    console.log('🔍 DEBUG REPOSITORY (Timezone Fixed):')
    console.log('organizationId:', organizationId)
    console.log('monthStart:', monthStart)
    console.log('monthEnd:', monthEnd)

    // CORREÇÃO: Usar dayjs com timezone UTC para evitar problemas
    const startOfTheDay = date
      ? dayjs.utc(date).startOf('day').toDate()
      : dayjs.utc(monthStart).startOf('day').toDate()

    const endOfTheDay = date
      ? lastDayOfMonth(startOfTheDay)
      : lastDayOfMonth(dayjs.utc(monthEnd).startOf('day').toDate())

    console.log('🔍 DATAS CALCULADAS (UTC):')
    console.log('startOfTheDay:', startOfTheDay.toISOString())
    console.log('endOfTheDay:', endOfTheDay.toISOString())

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

    console.log('🔍 WHERE CLAUSE:')
    console.log(JSON.stringify(whereClause, null, 2))

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: {
        expiration_date: 'desc',
      },
    })

    console.log('🔍 RESULTADO:')
    console.log('Total de transações encontradas:', expenses.length)

    if (expenses.length > 0) {
      console.log('Primeira transação:', {
        id: expenses[0].id,
        description: expenses[0].description,
        expiration_date: expenses[0].expiration_date,
        expiration_date_iso: expenses[0].expiration_date.toISOString(),
        organizationId: expenses[0].organizationId,
      })
    }

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
