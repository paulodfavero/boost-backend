import { ExpensesProjectionRepository } from '@/repositories/expenses-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { normalizeCategory } from '@/lib/category-translation'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface ExpenseProjectionRepository {
  id: string
  expirationDate?: string | number | null // Apenas o dia (ex: "15" ou 15)
  description?: string | null
  company?: string | null
  category?: string | null
  amount?: number | null
  typePayment?: string | null
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean | null
  isHidden?: boolean | null
  updateAllInGroup?: boolean
}

interface ExpenseProjectionType {
  organizationId: string
  reqBody: ExpenseProjectionRepository
}

export class UpdateExpensesProjectionUseCase {
  constructor(
    private expensesProjectionRepository: ExpensesProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: ExpenseProjectionType): Promise<object> {
    const { organizationId, reqBody } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()
    const {
      id,
      description,
      category,
      amount,
      paid,
      isHidden,
      expirationDate,
      company,
      typePayment,
      installmentCurrent,
      installmentTotalPayment,
      updateAllInGroup = false,
    } = reqBody

    // Only process category if it was provided in the request
    let processedCategory: string | undefined
    if (category !== undefined && category !== null) {
      // Normalize category to ensure it's never null or empty
      processedCategory = normalizeCategory(category)
    }

    const dataReturn: any = {
      id,
      description,
      amount,
      paid,
      isHidden,
      installmentCurrent,
      expirationDate,
      company,
      typePayment,
      installmentTotalPayment,
      organizationId,
    }

    // Only include category if it was provided
    if (processedCategory !== undefined) {
      dataReturn.category = processedCategory
    }

    if (updateAllInGroup) {
      // Find the transaction to get its group_installment_id
      const transaction = await this.expensesProjectionRepository.findById(id)

      if (!transaction || !transaction.group_installment_id) {
        // If no group, just update the single transaction
        return await this.expensesProjectionRepository.update(dataReturn)
      }

      // Update all transactions in the group (excluding item-specific fields)
      const { id: _, installmentCurrent, ...groupData } = dataReturn

      return await this.expensesProjectionRepository.updateManyByGroupId(
        transaction.group_installment_id,
        groupData,
      )
    }

    // Default behavior: update only the single transaction
    const response = await this.expensesProjectionRepository.update(dataReturn)

    return response
  }
}
