import { prisma } from '@/lib/prisma'
import {
  CategoriesRepository,
  CreateCategoryUseCaseResponse,
} from '../category-repository'
import { Category } from '@prisma/client'

export class PrismaCategoriesRepository implements CategoriesRepository {
  async searchMany(): Promise<Category[]> {
    const categories = await prisma.category.findMany()
    return categories
  }

  async createMany(data: CreateCategoryUseCaseResponse[]): Promise<Category> {
    const category = await prisma.category.createMany({
      data: data.map((item) => ({
        id: item.id,
        description: item.description,
        descriptionTranslated: item.descriptionTranslated,
      })),
      skipDuplicates: true,
    })
    return category as unknown as Category
  }
}
