import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaGainsProjectionRepository } from '@/repositories/prisma/gains-projection-repository'
import { PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'
import { SearchExpensesProjectionUseCase } from '../search-expenses-projection'

export function makeSearchExpensesProjectionUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const gainsProjectionRepository = new PrismaGainsProjectionRepository()
  const banksTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const searchExpensesProjectionUseCase = new SearchExpensesProjectionUseCase(
    expensesProjectionRepository,
    gainsProjectionRepository,
    banksTypeAccountRepository,
  )

  return searchExpensesProjectionUseCase
}
