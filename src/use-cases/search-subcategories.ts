import { SubCategoriesRepository } from '@/repositories/subcategory-repository'

export class SearchSubcategoryUseCase {
  constructor(private subcategoriesRepository: SubCategoriesRepository) {}

  async execute(): Promise<object> {
    const categories = await this.subcategoriesRepository.searchMany()

    return categories
  }
}
