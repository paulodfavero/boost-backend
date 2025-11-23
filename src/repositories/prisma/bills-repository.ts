import { prisma } from '@/lib/prisma'
import { BillsRepository } from '../bills-repository'
import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

export class PrismaBillsRepository implements BillsRepository {
  async searchMany(
    organizationId: string,
    month?: string,
    year?: string,
    paid?: boolean,
  ) {
    const where: Prisma.BillWhereInput = {
      organizationId,
    }

    if (month && year) {
      const startOfMonth = dayjs(`${year}-${month}-01`)
        .startOf('month')
        .toDate()
      const endOfMonth = dayjs(`${year}-${month}-01`).endOf('month').toDate()

      where.expiration_date = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    if (paid !== undefined) {
      where.paid = paid
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: {
        expiration_date: 'asc',
      },
    })

    return bills
  }

  async create(data: Prisma.BillCreateInput) {
    const bill = await prisma.bill.create({
      data,
    })

    return bill
  }

  async findById(billId: string) {
    const bill = await prisma.bill.findUnique({
      where: {
        id: billId,
      },
    })

    return bill
  }

  async update(billId: string, data: Prisma.BillUpdateInput) {
    const bill = await prisma.bill.update({
      where: {
        id: billId,
      },
      data: {
        ...data,
        updated_at: new Date(),
      },
    })

    return bill
  }

  async markAsPaid(billId: string, paid: boolean) {
    const bill = await prisma.bill.update({
      where: {
        id: billId,
      },
      data: {
        paid,
        updated_at: new Date(),
      },
    })

    return bill
  }

  async delete(billId: string) {
    await prisma.bill.delete({
      where: {
        id: billId,
      },
    })
  }

  async deleteManyByOrganization(organizationId: string) {
    await prisma.bill.deleteMany({
      where: {
        organizationId,
      },
    })
  }

  async findActiveBills(organizationId: string) {
    const bills = await prisma.bill.findMany({
      where: {
        organizationId,
        active: true,
      },
    })

    return bills
  }
}
