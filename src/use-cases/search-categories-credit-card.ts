import { CategoriesCreditCardRepository } from '@/repositories/category-credit-card-repository'

export class SearchCategoryCreditCardUseCase {
  constructor(
    private categoriesCreditCardRepository: CategoriesCreditCardRepository,
  ) {}

  async execute(): Promise<object> {
    const categories = await this.categoriesCreditCardRepository.searchMany()

    return categories
  }
}
