import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { CreateExpenseUseCase } from '../create-expense'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateExpenseUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateExpenseUseCase(
    expenseRepository,
    organizationRepository,
  )

  return useCase
}
