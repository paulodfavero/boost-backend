import { prisma } from '@/lib/prisma'
import { GainsRepository } from '../gain-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'

interface GainUpdateRepository {
  id: string
  expirationDate?: string | Date
  description?: string
  company?: string
  category?: string
  amount?: number
  typePayment?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean
  isHidden?: boolean
  organizationId: string
}

export class PrismaGainRepository implements GainsRepository {
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

    const gains = await prisma.gain.findMany({
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

    return gains
  }

  async createMany(data: Prisma.Enumerable<Prisma.GainCreateManyInput>) {
    const gain = await prisma.gain.createMany({
      data,
      skipDuplicates: true,
    })

    return gain
  }

  async update(data: GainUpdateRepository) {
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

    const gain = await prisma.gain.update({
      where: {
        id,
      },
      data: prismaData,
    })

    return gain
  }

  async delete(transactionId: string) {
    const gain = await prisma.gain.delete({
      where: {
        id: transactionId,
      },
    })

    return gain
  }

  async deleteMany(bankId: string) {
    const gain = await prisma.gain.deleteMany({
      where: {
        bankId,
      },
    })

    return gain
  }

  async deleteManyByOrganization(organizationId: string) {
    const gain = await prisma.gain.deleteMany({
      where: {
        organizationId,
      },
    })

    return gain
  }
}
