import { prisma } from '@/lib/prisma'
import {
  CategoriesCreditCardRepository,
  CreateCategoryCreditCardUseCaseResponse,
} from '../category-credit-card-repository'
import { CategoryCreditCard } from '@prisma/client'

export class PrismaCategoriesCreditCardRepository
  implements CategoriesCreditCardRepository
{
  async searchMany(): Promise<CategoryCreditCard[]> {
    const categories = await prisma.categoryCreditCard.findMany()
    return categories
  }

  async createMany(
    data: CreateCategoryCreditCardUseCaseResponse[],
  ): Promise<CategoryCreditCard> {
    const category = await prisma.categoryCreditCard.createMany({
      data: data.map((item) => ({
        id: item.id,
        description: item.description,
        descriptionTranslated: item.descriptionTranslated,
      })),
      skipDuplicates: true,
    })
    return category as unknown as CategoryCreditCard
  }
}
