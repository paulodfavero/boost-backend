import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { UpdateExpensesProjectionUseCase } from '../update-expenses-projection'

export function makeUpdateExpensesProjectionUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const updateExpensesProjectionUseCase = new UpdateExpensesProjectionUseCase(
    expensesProjectionRepository,
    organizationsRepository,
  )

  return updateExpensesProjectionUseCase
}

