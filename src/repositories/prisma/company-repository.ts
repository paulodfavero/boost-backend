import { prisma } from '@/lib/prisma'
import { CompaniesRepository } from '../company-repository'
import { Prisma } from '@prisma/client'

export class PrismaCompaniesRepository implements CompaniesRepository {
  async searchMany(query: string) {
    const companies = await prisma.company.findMany({
      where: {
        organizationId: query,
      },
    })

    return companies
  }

  async create(data: Prisma.CompanyCreateInput) {
    const company = await prisma.company.create({
      data,
    })

    return company
  }

  async deleteManyByOrganization(organizationId: string) {
    const result = await prisma.company.deleteMany({
      where: {
        organizationId,
      },
    })

    return result
  }
}
