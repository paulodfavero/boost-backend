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
  isHidden?: boolean
  organizationId: string
  merchant?: MerchantType
  bankId?: string
}

export class PrismaExpenseRepository implements ExpensesRepository {
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

    const expenses = await prisma.expense.findMany({
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
    const {
      id,
      expirationDate,
      typePayment,
      installmentCurrent,
      installmentTotalPayment,
      groupInstallmentId,
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
      ...(groupInstallmentId !== undefined && {
        group_installment_id: groupInstallmentId,
      }),
      ...(isHidden !== undefined && { isHidden }),
    }

    const expense = await prisma.expense.update({
      where: {
        id,
      },
      data: prismaData,
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

  async deleteManyByOrganization(organizationId: string) {
    const expense = await prisma.expense.deleteMany({
      where: {
        organizationId,
      },
    })

    return expense
  }
}
