import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { SearchResultsUseCase } from '../search-results'

export function makeSearchResultUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const gainRepository = new PrismaGainRepository()
  const creditRepository = new PrismaCreditRepository()

  const useCase = new SearchResultsUseCase(
    expenseRepository,
    gainRepository,
    creditRepository,
  )

  return useCase
}
