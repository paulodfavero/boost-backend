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
  isHidden?: boolean
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
      isHidden,
      expirationDate,
      company,
      typePayment,
      installmentCurrent,
      installmentTotalPayment,
    } = reqBody

    // Only process category if it was provided in the request
    let processedCategory: string | undefined
    if (category !== undefined) {
      // Translate category from English to Portuguese
      const translatedCategory = translateCategory(category)
      // Normalize category to ensure it's never null or empty
      processedCategory = normalizeCategory(translatedCategory)
    }
    console.log('expirationDate', expirationDate)

    const dataReturn: any = {
      id,
      description,
      amount,
      paid,
      isHidden,
      installment_current: installmentCurrent,
      expiration_date: expirationDate,
      company,
      type_payment: typePayment,
      installment_total_payment: installmentTotalPayment,
      organizationId,
    }

    // Only include category if it was provided
    if (processedCategory !== undefined) {
      dataReturn.category = processedCategory
    }

    const response = await this.expensesRepository.update(dataReturn)

    return response
  }
}
