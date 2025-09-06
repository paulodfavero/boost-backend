import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { PrismaBanksRepository } from '@/repositories/prisma/bank-repository'
import { PrismaInvestmentRepository } from '@/repositories/prisma/investment-repository'
import { ChatUseCase } from '../chat'
import { prisma } from '@/lib/prisma'

export function makeChatUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const expensesRepository = new PrismaExpenseRepository()
  const gainsRepository = new PrismaGainRepository()
  const creditsRepository = new PrismaCreditRepository()
  const goalsRepository = new PrismaGoalsRepository(prisma)
  const banksRepository = new PrismaBanksRepository()
  const investmentRepository = new PrismaInvestmentRepository()

  const useCase = new ChatUseCase(
    organizationsRepository,
    expensesRepository,
    gainsRepository,
    creditsRepository,
    goalsRepository,
    banksRepository,
    investmentRepository,
  )

  return useCase
}
