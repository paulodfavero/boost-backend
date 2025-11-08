import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaGainsProjectionRepository } from '@/repositories/prisma/gains-projection-repository'
import { PrismaCreditsProjectionRepository } from '@/repositories/prisma/credits-projection-repository'
import { PrismaBanksRepository } from '@/repositories/prisma/bank-repository'
import { SearchFinancialProjectionMonthDetailsUseCase } from '../search-financial-projection-month-details'

export function makeSearchFinancialProjectionMonthDetailsUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const gainsProjectionRepository = new PrismaGainsProjectionRepository()
  const creditsProjectionRepository = new PrismaCreditsProjectionRepository()
  const bankRepository = new PrismaBanksRepository()

  const useCase = new SearchFinancialProjectionMonthDetailsUseCase(
    expensesProjectionRepository,
    gainsProjectionRepository,
    creditsProjectionRepository,
    bankRepository,
  )

  return useCase
}
