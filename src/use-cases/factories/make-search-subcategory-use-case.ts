import { PrismaSubcategoriesRepository } from '@/repositories/prisma/subcategory-repository'
import { SearchSubcategoryUseCase } from '../search-subcategories'

export function makeSearchCategoryUseCase() {
  const subcategoryRepository = new PrismaSubcategoriesRepository()

  const useCase = new SearchSubcategoryUseCase(subcategoryRepository)

  return useCase
}
