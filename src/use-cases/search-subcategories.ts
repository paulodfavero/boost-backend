import { SubCategoriesRepository } from '@/repositories/subcategory-repository'
import { CategoriesCreditCardRepository } from '@/repositories/category-credit-card-repository'

export class SearchSubcategoryUseCase {
  constructor(
    private subcategoriesRepository: SubCategoriesRepository,
    private categoriesCreditCardRepository: CategoriesCreditCardRepository,
  ) {}

  async execute(): Promise<object> {
    const [subcategories, categoriesCreditCard] = await Promise.all([
      this.subcategoriesRepository.searchMany(),
      this.categoriesCreditCardRepository.searchMany(),
    ])
    return [...subcategories, ...categoriesCreditCard]
  }
}
