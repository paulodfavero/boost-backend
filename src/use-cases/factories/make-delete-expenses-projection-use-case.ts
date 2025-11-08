import { PrismaExpensesProjectionRepository } from '@/repositories/prisma/expenses-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { DeleteExpensesProjectionUseCase } from '../delete-expenses-projection'

export function makeDeleteExpensesProjectionUseCase() {
  const expensesProjectionRepository = new PrismaExpensesProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const useCase = new DeleteExpensesProjectionUseCase(
    expensesProjectionRepository,
    organizationsRepository,
  )

  return useCase
}
