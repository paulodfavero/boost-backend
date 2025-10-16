import { DeleteOrganizationUseCase } from '../delete-organization'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import {
  PrismaBanksRepository,
  PrismaBankTypeAccountRepository,
} from '@/repositories/prisma/bank-repository'
import { PrismaCategoriesRepository } from '@/repositories/prisma/category-repository'
import { PrismaCompaniesRepository } from '@/repositories/prisma/company-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { PrismaGoalsRepository } from '@/repositories/prisma/prisma-goals-repository'
import { PrismaSuggestionsRepository } from '@/repositories/prisma/suggestion-repository'
import { PrismaUsersRepository } from '@/repositories/prisma/user-repository'
import { PrismaInvestmentRepository } from '@/repositories/prisma/investment-repository'
import { PrismaAccessLogRepository } from '@/repositories/access-log-repository'
import { prisma } from '@/lib/prisma'

export function makeDeleteOrganizationUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const banksRepository = new PrismaBanksRepository()
  const banksTypeAccountRepository = new PrismaBankTypeAccountRepository()
  const categoriesRepository = new PrismaCategoriesRepository()
  const companiesRepository = new PrismaCompaniesRepository()
  const creditsRepository = new PrismaCreditRepository()
  const expensesRepository = new PrismaExpenseRepository()
  const gainsRepository = new PrismaGainRepository()
  const goalsRepository = new PrismaGoalsRepository(prisma)
  const suggestionsRepository = new PrismaSuggestionsRepository()
  const usersRepository = new PrismaUsersRepository()
  const investmentsRepository = new PrismaInvestmentRepository()
  const accessLogsRepository = new PrismaAccessLogRepository()

  const deleteOrganizationUseCase = new DeleteOrganizationUseCase(
    organizationsRepository,
    banksRepository,
    banksTypeAccountRepository,
    categoriesRepository,
    companiesRepository,
    creditsRepository,
    expensesRepository,
    gainsRepository,
    goalsRepository,
    suggestionsRepository,
    usersRepository,
    investmentsRepository,
    accessLogsRepository,
  )

  return deleteOrganizationUseCase
}
