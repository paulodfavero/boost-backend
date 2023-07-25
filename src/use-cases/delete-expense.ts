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
    console.log(
      '%cdelete-expense.ts line:23 data',
      'color: #007acc;',
      transactionId,
    )

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    const response = await this.expensesRepository.delete(transactionId)

    return response
  }
}
