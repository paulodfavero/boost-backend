import { PrismaCategoriesRepository } from '@/repositories/prisma/category-repository'
import { SearchCategoryUseCase } from '../search-categories'

export function makeSearchCategoryUseCase() {
  const categoryRepository = new PrismaCategoriesRepository()

  const useCase = new SearchCategoryUseCase(categoryRepository)

  return useCase
}
