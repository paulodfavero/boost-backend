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

    // Concatenate categoriesCreditCard with their subcategories
    const result = categoriesCreditCard.map((category) => ({
      ...category,
      subcategories: subcategories.filter(
        (sub) => sub.categoryCreditCardId === category.id,
      ),
    }))

    return result
  }
}
