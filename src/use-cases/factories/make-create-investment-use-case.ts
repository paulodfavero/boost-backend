import { PrismaInvestmentRepository } from '@/repositories/prisma/investment-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { CreateInvestmentUseCase } from '../create-investment'

export function makeCreateInvestmentUseCase() {
  const investmentRepository = new PrismaInvestmentRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const createInvestmentUseCase = new CreateInvestmentUseCase(
    investmentRepository,
    organizationsRepository,
  )

  return createInvestmentUseCase
}
