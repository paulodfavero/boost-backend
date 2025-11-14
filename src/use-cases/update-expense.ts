import { ExpensesRepository } from '@/repositories/expense-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import {
  translateCategory,
  normalizeCategory,
} from '@/lib/category-translation'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface ExpenseRepository {
  id: string
  expirationDate?: string | Date
  description?: string
  company?: string
  category?: string
  amount?: number
  typePayment?: string
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean
}

interface ExpenseType {
  organizationId: string
  reqBody: ExpenseRepository
}

export class UpdateExpenseUseCase {
  constructor(
    private expensesRepository: ExpensesRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: ExpenseType): Promise<object> {
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
      expirationDate,
      company,
      typePayment,
      installmentCurrent,
      installmentTotalPayment,
    } = reqBody

    // Translate category from English to Portuguese
    const translatedCategory = translateCategory(category)

    // Normalize category to ensure it's never null or empty
    const normalizedCategory = normalizeCategory(translatedCategory)

    const dataReturn = {
      id,
      description,
      category: normalizedCategory,
      amount,
      paid,
      installment_current: installmentCurrent,
      expiration_date: expirationDate,
      company,
      type_payment: typePayment,
      installment_total_payment: installmentTotalPayment,
      organizationId,
    }

    const response = await this.expensesRepository.update(dataReturn)

    return response
  }
}
