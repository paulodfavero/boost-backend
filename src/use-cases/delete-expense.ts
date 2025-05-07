import { ExpensesRepository } from '@/repositories/expense-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface ExpenseType {
  organizationId: string
  transactionId: string
}

export class DeleteExpenseUseCase {
  constructor(
    private expensesRepository: ExpensesRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: ExpenseType): Promise<object> {
    const { organizationId, transactionId } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.expensesRepository.delete(transactionId)

    return response
  }
}
