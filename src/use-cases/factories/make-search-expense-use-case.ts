import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { SearchExpenseUseCase } from '../search-expenses'

export function makeSearchExpenseUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const gainRepository = new PrismaGainRepository()

  const useCase = new SearchExpenseUseCase(expenseRepository, gainRepository)

  return useCase
}
