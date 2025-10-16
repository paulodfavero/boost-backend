import { prisma } from '@/lib/prisma'
import { CategoriesRepository } from '../category-repository'
import { Prisma } from '@prisma/client'

export class PrismaCategoriesRepository implements CategoriesRepository {
  async searchMany(organizationId: string) {
    const categories = await prisma.category.findMany({
      where: {
        organizationId,
      },
    })

    return categories
  }

  async create(data: Prisma.CategoryCreateInput) {
    const category = await prisma.category.create({
      data,
    })

    return category
  }

  async deleteManyByOrganization(organizationId: string) {
    const result = await prisma.category.deleteMany({
      where: {
        organizationId,
      },
    })

    return result
  }
}
