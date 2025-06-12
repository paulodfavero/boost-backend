import { PrismaCategoriesCreditCardRepository } from '@/repositories/prisma/category-credit-card-repository'
import { CreateCategoryCreditCardUseCase } from '../create-category-credit-card'

export function makeCreateCategoryCreditCardUseCase() {
  const categoryCreditCardRepository =
    new PrismaCategoriesCreditCardRepository()

  const useCase = new CreateCategoryCreditCardUseCase(
    categoryCreditCardRepository,
  )

  return useCase
}
