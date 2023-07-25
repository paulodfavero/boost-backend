import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { UpdateExpenseUseCase } from '../update-expense'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeUpdateExpenseUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new UpdateExpenseUseCase(
    expenseRepository,
    organizationRepository,
  )

  return useCase
}
