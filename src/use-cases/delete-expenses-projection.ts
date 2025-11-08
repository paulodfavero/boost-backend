import { ExpensesProjectionRepository } from '@/repositories/expenses-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface ExpenseProjectionType {
  organizationId: string
  transactionId: string
}

export class DeleteExpensesProjectionUseCase {
  constructor(
    private expensesProjectionRepository: ExpensesProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: ExpenseProjectionType): Promise<object> {
    const { organizationId, transactionId } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.expensesProjectionRepository.delete(
      transactionId,
    )

    return response
  }
}
