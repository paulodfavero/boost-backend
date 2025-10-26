import { FinancialScoreUseCase } from '../financial-score'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'

export function makeFinancialScoreUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const expensesRepository = new PrismaExpenseRepository()
  const creditsRepository = new PrismaCreditRepository()
  const gainsRepository = new PrismaGainRepository()

  const financialScoreUseCase = new FinancialScoreUseCase(
    organizationsRepository,
    expensesRepository,
    creditsRepository,
    gainsRepository,
  )

  return financialScoreUseCase
}
