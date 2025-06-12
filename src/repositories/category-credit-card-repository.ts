import { CategoryCreditCard } from '@prisma/client'

export interface CreateCategoryCreditCardUseCaseResponse {
  description: string
  descriptionTranslated: string
  id: string
}

export interface CategoriesCreditCardRepository {
  searchMany(): Promise<CategoryCreditCard[]>
  createMany(
    data: CreateCategoryCreditCardUseCaseResponse[],
  ): Promise<CategoryCreditCard>
}
