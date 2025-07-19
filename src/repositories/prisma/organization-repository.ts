import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { subMonths, startOfMonth, endOfMonth } from 'date-fns'

import { OrganizationsRepository } from '../organization-repository'

export class PrismaOrganizationsRepository implements OrganizationsRepository {
  async create(data: Prisma.OrganizationCreateInput) {
    const organization = await prisma.organization.create({
      data,
    })

    return organization
  }

  async findById(id: string) {
    const organization = await prisma.organization.findUnique({
      where: {
        id,
      },
    })

    return organization
  }

  async findByEmail(email: string) {
    const organization = await prisma.organization.findUnique({
      where: {
        email,
      },
    })

    return organization
  }

  async update(data: {
    organizationId: string
    data: Partial<
      Omit<import('@prisma/client').Organization, 'id' | 'created_at'>
    >
  }) {
    const organization = await prisma.organization.update({
      where: {
        id: data.organizationId,
      },
      data: {
        ...data.data,
        updated_at: new Date(),
      },
    })

    return organization
  }

  async searchMany(date?: string) {
    if (!date) {
      const organizations = await prisma.organization.findMany({})
      return organizations
    }

    const [year, month] = date.split('/').map(Number)
    const results: Record<string, any[]> = {}

    for (let i = 0; i < 4; i++) {
      const current = subMonths(new Date(year, month - 1, 1), i)
      const startDate = startOfMonth(current)
      const endDate = endOfMonth(current)
      const orgs = await prisma.organization.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      })
      const key = `${current.getFullYear()}/${String(
        current.getMonth() + 1,
      ).padStart(2, '0')}`
      results[key] = orgs
    }
    return results
  }
}
