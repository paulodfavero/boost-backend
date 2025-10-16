import { prisma } from '@/lib/prisma'
import {
  CreateInvestmentData,
  Investment,
  InvestmentRepository,
  UpdateInvestmentData,
} from '../investment-repository'

export class PrismaInvestmentRepository implements InvestmentRepository {
  async create(data: CreateInvestmentData): Promise<Investment> {
    const investment = await prisma.investment.create({
      data: {
        investments: data.investments,
        organizationId: data.organizationId,
        bankId: data.bankId,
      },
    })

    return investment
  }

  async findById(id: string): Promise<Investment | null> {
    const investment = await prisma.investment.findUnique({
      where: {
        id,
      },
    })

    return investment
  }

  async findByOrganizationId(organizationId: string): Promise<Investment[]> {
    const investments = await prisma.investment.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return investments
  }

  async findByBankId(bankId: string): Promise<Investment | null> {
    const investment = await prisma.investment.findFirst({
      where: {
        bankId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return investment
  }

  async update(id: string, data: UpdateInvestmentData): Promise<Investment> {
    const investment = await prisma.investment.update({
      where: {
        id,
      },
      data: {
        investments: data.investments,
        bankId: data.bankId,
        updated_at: new Date(),
      },
    })

    return investment
  }

  async delete(id: string): Promise<void> {
    await prisma.investment.delete({
      where: {
        id,
      },
    })
  }

  async deleteManyByOrganization(organizationId: string): Promise<object> {
    const result = await prisma.investment.deleteMany({
      where: {
        organizationId,
      },
    })

    return result
  }
}
