import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaGainsProjectionRepository } from '@/repositories/prisma/gains-projection-repository'
import { PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'
import { SearchGainsProjectionUseCase } from '../search-gains-projection'

export function makeSearchGainsProjectionUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const gainsProjectionRepository = new PrismaGainsProjectionRepository()
  const banksTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const searchGainsProjectionUseCase = new SearchGainsProjectionUseCase(
    expensesProjectionRepository,
    gainsProjectionRepository,
    banksTypeAccountRepository,
  )

  return searchGainsProjectionUseCase
}
