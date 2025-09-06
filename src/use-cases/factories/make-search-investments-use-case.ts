import { PrismaInvestmentRepository } from '@/repositories/prisma/investment-repository'
import { SearchInvestmentsUseCase } from '../search-investments'

export function makeSearchInvestmentsUseCase() {
  const investmentRepository = new PrismaInvestmentRepository()

  const searchInvestmentsUseCase = new SearchInvestmentsUseCase(
    investmentRepository,
  )

  return searchInvestmentsUseCase
}
