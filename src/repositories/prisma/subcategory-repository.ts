import { prisma } from '@/lib/prisma'
import {
  SubCategoriesRepository,
  CreateSubcategoryUseCaseResponse,
} from '../subcategory-repository'
import { SubCategory } from '@prisma/client'

export class PrismaSubcategoriesRepository implements SubCategoriesRepository {
  async searchMany(): Promise<SubCategory[]> {
    const categories = await prisma.subCategory.findMany()
    return categories
  }

  async createMany(
    data: CreateSubcategoryUseCaseResponse[],
  ): Promise<SubCategory> {
    // Check if all categories exist
    for (const item of data) {
      const category = await prisma.category.findUnique({
        where: { id: item.categoryId },
      })
      if (!category) {
        throw new Error(`Category with id ${item.categoryId} does not exist`)
      }
    }

    const subcategory = await prisma.subCategory.createMany({
      data: data.map((item) => ({
        id: item.id,
        description: item.description,
        descriptionTranslated: item.descriptionTranslated,
        parentDescription: item.parentDescription,
        categoryId: item.categoryId,
      })),
      skipDuplicates: true,
    })
    return subcategory as unknown as SubCategory
  }
}
