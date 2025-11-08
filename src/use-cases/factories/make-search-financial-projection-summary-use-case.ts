import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaGainsProjectionRepository } from '@/repositories/prisma/gains-projection-repository'
import { PrismaCreditsProjectionRepository } from '@/repositories/prisma/credits-projection-repository'
import { SearchFinancialProjectionSummaryUseCase } from '../search-financial-projection-summary'

export function makeSearchFinancialProjectionSummaryUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const gainsProjectionRepository = new PrismaGainsProjectionRepository()
  const creditsProjectionRepository = new PrismaCreditsProjectionRepository()

  const useCase = new SearchFinancialProjectionSummaryUseCase(
    expensesProjectionRepository,
    gainsProjectionRepository,
    creditsProjectionRepository,
  )

  return useCase
}
