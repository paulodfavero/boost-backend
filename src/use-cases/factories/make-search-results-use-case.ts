import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { SearchResultsUseCase } from '../search-results'

export function makeSearchResultUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const gainRepository = new PrismaGainRepository()

  const useCase = new SearchResultsUseCase(expenseRepository, gainRepository)

  return useCase
}
