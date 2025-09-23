import { PrismaSubcategoriesRepository } from '@/repositories/prisma/subcategory-repository'
import { PrismaCategoriesCreditCardRepository } from '@/repositories/prisma/category-credit-card-repository'
import { SearchSubcategoryUseCase } from '../search-subcategories'

export function makeSearchCategoryUseCase() {
  const subcategoryRepository = new PrismaSubcategoriesRepository()
  const categoriesCreditCardRepository =
    new PrismaCategoriesCreditCardRepository()

  const useCase = new SearchSubcategoryUseCase(
    subcategoryRepository,
    categoriesCreditCardRepository,
  )

  return useCase
}
