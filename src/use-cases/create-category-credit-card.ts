import { CategoriesCreditCardRepository } from '@/repositories/category-credit-card-repository'
import { CategoryCreditCard } from '@prisma/client'

interface CreateCategoryCreditCardUseCaseResponse {
  description: string
  descriptionTranslated: string
  id: string
}
interface CategoryCreditCardType {
  reqBody: CreateCategoryCreditCardUseCaseResponse[]
}
export class CreateCategoryCreditCardUseCase {
  constructor(private categoriesRepository: CategoriesCreditCardRepository) {}

  async execute(data: CategoryCreditCardType): Promise<CategoryCreditCard> {
    const { reqBody: categories } = data
    const category = await this.categoriesRepository.createMany(categories)

    return category
  }
}
