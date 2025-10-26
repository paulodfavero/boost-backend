import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { CreateExpensesProjectionUseCase } from '../create-expenses-projection'

export function makeCreateExpensesProjectionUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const createExpensesProjectionUseCase = new CreateExpensesProjectionUseCase(
    expensesProjectionRepository,
    organizationsRepository,
  )

  return createExpensesProjectionUseCase
}

