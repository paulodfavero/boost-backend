import { CategoriesRepository } from '@/repositories/category-repository'

export class SearchCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute(): Promise<object> {
    const categories = await this.categoriesRepository.searchMany()

    return categories
  }
}
