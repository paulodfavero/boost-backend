import { CategoriesRepository } from '@/repositories/category-repository'

interface SearchCategoryUseCaseRequest {
  query: string
  organizationId: string
}

export class SearchCategoryUseCase {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async execute({
    query,
    organizationId,
  }: SearchCategoryUseCaseRequest): Promise<object> {
    const categories = await this.categoriesRepository.searchMany(
      query,
      organizationId,
    )

    return {
      categories,
    }
  }
}
