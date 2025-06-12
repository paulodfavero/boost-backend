import { PrismaCategoriesCreditCardRepository } from '@/repositories/prisma/category-credit-card-repository'
import { SearchCategoryCreditCardUseCase } from '../search-categories-credit-card'

export function makeSearchCategoryCreditCardUseCase() {
  const categoryRepository = new PrismaCategoriesCreditCardRepository()

  const useCase = new SearchCategoryCreditCardUseCase(categoryRepository)

  return useCase
}
