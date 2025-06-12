import { PrismaCategoriesRepository } from '@/repositories/prisma/category-repository'
import { CreateCategoryUseCase } from '../create-category'

export function makeCreateCategoryUseCase() {
  const categoryRepository = new PrismaCategoriesRepository()

  const useCase = new CreateCategoryUseCase(categoryRepository)

  return useCase
}
