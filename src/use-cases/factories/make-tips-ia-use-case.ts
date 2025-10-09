import { TipsIaUseCase } from '../tips-ia'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'

export function makeTipsIaUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const expensesRepository = new PrismaExpenseRepository()
  const creditsRepository = new PrismaCreditRepository()
  const gainsRepository = new PrismaGainRepository()
  const banksTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const tipsIaUseCase = new TipsIaUseCase(
    organizationsRepository,
    expensesRepository,
    creditsRepository,
    gainsRepository,
    banksTypeAccountRepository,
  )

  return tipsIaUseCase
}
