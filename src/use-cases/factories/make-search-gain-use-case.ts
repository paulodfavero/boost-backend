import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { SearchGainUseCase } from '../search-gains'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'

export function makeSearchGainUseCase() {
  const gainRepository = new PrismaGainRepository()
  const expenseRepository = new PrismaExpenseRepository()
  const useCase = new SearchGainUseCase(gainRepository, expenseRepository)

  return useCase
}
