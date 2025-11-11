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

  async update(data: GainProjectionUpdateRepository) {
    const gainProjection = await prisma.gainsProjection.update({
      where: {
        id: data.id,
      },
      data,
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


