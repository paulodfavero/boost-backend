import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { DeleteExpenseUseCase } from '../delete-expense'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeDeleteExpenseUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new DeleteExpenseUseCase(
    expenseRepository,
    organizationRepository,
  )

  return useCase
}
