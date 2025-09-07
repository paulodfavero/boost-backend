import { TipsIaUseCase } from '../tips-ia'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'

export function makeTipsIaUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const expensesRepository = new PrismaExpenseRepository()
  const creditsRepository = new PrismaCreditRepository()

  const tipsIaUseCase = new TipsIaUseCase(
    organizationsRepository,
    expensesRepository,
    creditsRepository,
  )

  return tipsIaUseCase
}
