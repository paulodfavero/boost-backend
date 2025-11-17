import { prisma } from '@/lib/prisma'
import { ExpensesProjectionRepository } from '../expenses-projection-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'

interface ExpenseProjectionUpdateRepository {
  id: string
  expirationDate?: string | number | null // Apenas o dia (ex: "15" ou 15)
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

    // Busca a transação atual para pegar a data original
    const currentTransaction = await prisma.expensesProjection.findUnique({
      where: { id },
      select: { expiration_date: true },
    })

    // Atualiza apenas o dia, mantendo mês e ano da data original
    let expirationDateFormatted: Date | undefined
    if (expirationDate !== undefined && expirationDate !== null) {
      if (currentTransaction) {
        const originalDate = new Date(currentTransaction.expiration_date)
        // expirationDate agora é apenas o dia (string ou number)
        const newDay =
          typeof expirationDate === 'string'
            ? parseInt(expirationDate, 10)
            : expirationDate

        // Mantém mês e ano da data original, altera apenas o dia
        expirationDateFormatted = new Date(
          originalDate.getFullYear(),
          originalDate.getMonth(),
          newDay,
          originalDate.getHours(),
          originalDate.getMinutes(),
          originalDate.getSeconds(),
          originalDate.getMilliseconds(),
        )
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
      expirationDate?: string | number | null // Apenas o dia (ex: "15" ou 15)
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
    // expirationDate agora é apenas o dia (string ou number)
    let newDay: number | undefined
    if (data.expirationDate !== undefined && data.expirationDate !== null) {
      newDay =
        typeof data.expirationDate === 'string'
          ? parseInt(data.expirationDate, 10)
          : data.expirationDate
    }

    // Busca todas as transações do grupo para atualizar individualmente
    // (necessário para manter mês e ano de cada uma, alterando apenas o dia)
    if (newDay !== undefined) {
      const transactions = await prisma.expensesProjection.findMany({
        where: {
          group_installment_id: groupInstallmentId,
        },
        select: {
          id: true,
          expiration_date: true,
        },
      })

      // Atualiza cada transação individualmente mantendo mês e ano
      for (const transaction of transactions) {
        const originalDate = new Date(transaction.expiration_date)
        const updatedDate = new Date(
          originalDate.getFullYear(),
          originalDate.getMonth(),
          newDay,
          originalDate.getHours(),
          originalDate.getMinutes(),
          originalDate.getSeconds(),
          originalDate.getMilliseconds(),
        )

        await prisma.expensesProjection.update({
          where: { id: transaction.id },
          data: { expiration_date: updatedDate },
        })
      }
    }

    // Map values for Prisma updateMany (only include defined, non-null values)
    // Para outros campos que não são expirationDate, usa updateMany
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

    // Só faz updateMany se houver outros campos além de expirationDate
    if (Object.keys(prismaData).length > 0) {
      await prisma.expensesProjection.updateMany({
        where: {
          group_installment_id: groupInstallmentId,
        },
        data: prismaData,
      })
    }

    // Retorna o resultado (contagem de registros atualizados)
    const expenseProjection = await prisma.expensesProjection.findMany({
      where: {
        group_installment_id: groupInstallmentId,
      },
    })

    return { count: expenseProjection.length }
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
