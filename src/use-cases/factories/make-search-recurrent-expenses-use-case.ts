import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { SearchRecurrentExpensesUseCase } from '../search-recurrent-expenses'
import {
  PrismaBankTypeAccountRepository,
  PrismaBanksRepository,
} from '@/repositories/prisma/bank-repository'

export function makeSearchRecurrentExpensesUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchRecurrentExpensesUseCase(
    expenseRepository,
    bankRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
