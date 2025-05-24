import { prisma } from '@/lib/prisma'
import { CreditsRepository } from '../credit-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { lastDayOfMonth } from 'date-fns'

interface CreditUpdateRepository {
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

export class PrismaCreditRepository implements CreditsRepository {
  async searchMany(organizationId: string, date?: string, monthStart?: string, monthEnd?: string) {

    const startOfTheDay = date ? dayjs(date).startOf('date').toDate() : dayjs(monthStart).startOf('date').toDate();
    const endOfTheDay = date ? lastDayOfMonth(startOfTheDay) : lastDayOfMonth(dayjs(monthEnd).startOf('date').toDate());    


    const credits = await prisma.credit.findMany({
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

    return credits
  }

  async createMany(data: Prisma.Enumerable<Prisma.CreditCreateManyInput>) {
    const credit = await prisma.credit.createMany({
      data,
      skipDuplicates: true,
    })

    return credit
  }

  async update(data: CreditUpdateRepository) {
    const credit = await prisma.credit.update({
      where: {
        id: data.id,
      },
      data,
    })

    return credit
  }

  async delete(transactionId: string) {
    const credit = await prisma.credit.delete({
      where: {
        id: transactionId,
      },
    })

    return credit
  }

  async deleteMany(bankId: string) {
    const credit = await prisma.credit.deleteMany({
      where: {
        bankId,
      },
    })

    return credit
  }

  async searchCardList(organizationId: string) { 

    const credits = await prisma.credit.findMany({
      where: {
        organizationId: {
          contains: organizationId,
        },        
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return credits
  }
}
