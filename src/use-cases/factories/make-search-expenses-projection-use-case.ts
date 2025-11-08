import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'
import { SearchExpensesProjectionUseCase } from '../search-expenses-projection'

export function makeSearchExpensesProjectionUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const banksTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const searchExpensesProjectionUseCase = new SearchExpensesProjectionUseCase(
    expensesProjectionRepository,
    banksTypeAccountRepository,
  )

  return searchExpensesProjectionUseCase
}
