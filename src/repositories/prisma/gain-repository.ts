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
  organizationId: string
}

export class PrismaGainRepository implements GainsRepository {
  async searchMany(organizationId: string, date: string) {
    const startOfTheDay = dayjs(date).startOf('date').toDate()
    const endOfTheDay = lastDayOfMonth(startOfTheDay)

    const gains = await prisma.gain.findMany({
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
    const gain = await prisma.gain.update({
      where: {
        id: data.id,
      },
      data,
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
}
