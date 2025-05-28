import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import { OrganizationsRepository } from '../organization-repository'

export class PrismaOrganizationsRepository implements OrganizationsRepository {
  async create(data: Prisma.OrganizationCreateInput) {
    const organization = await prisma.organization.create({
      data,
    })

    return organization
  }

  async findById(id: string) {
    console.log(
      '%csrc/repositories/prisma/organization-repository.ts:16 id',
      'color: #007acc;',
      id,
    )
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

  async update(data: { organizationId: string; stripeCustomerId: string }) {
    const organization = await prisma.organization.update({
      where: {
        id: data.organizationId,
      },
      data: {
        stripe_customer_id: data.stripeCustomerId,
      },
    })

    return organization
  }
}
