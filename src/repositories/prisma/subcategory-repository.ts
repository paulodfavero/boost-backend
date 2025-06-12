import { prisma } from '@/lib/prisma'
import {
  SubCategoriesRepository,
  CreateSubcategoryUseCaseResponse,
} from '../subcategory-repository'
import { SubCategoryCreditCard } from '@prisma/client'

export class PrismaSubcategoriesRepository implements SubCategoriesRepository {
  async searchMany(): Promise<SubCategoryCreditCard[]> {
    const categories = await prisma.subCategoryCreditCard.findMany()
    return categories
  }

  async createMany(
    data: CreateSubcategoryUseCaseResponse[],
  ): Promise<SubCategoryCreditCard> {
    // Check if all categories exist

    for (const item of data) {
      const category = await prisma.categoryCreditCard.findUnique({
        where: { id: item.categoryId },
      })
      if (!category) {
        throw new Error(`Category with id ${item.categoryId} does not exist`)
      }
    }

    const subcategory = await prisma.subCategoryCreditCard.createMany({
      data: data.map((item) => ({
        id: item.id,
        description: item.description,
        descriptionTranslated: item.descriptionTranslated,
        parentDescription: item.parentDescription,
        categoryCreditCardId: item.categoryId,
      })),
      skipDuplicates: true,
    })
    return subcategory as unknown as SubCategoryCreditCard
  }
}
