import { OrganizationsRepository } from '@/repositories/organization-repository'
import {
  translateCategory,
  normalizeCategory,
} from '@/lib/category-translation'

import { OrganizationNotFound } from './errors/organization-not-found-error'
import { CreditsRepository } from '@/repositories/credit-repository'

interface CreditRepository {
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

interface CreditType {
  organizationId: string
  reqBody: CreditRepository
}

export class UpdateCreditUseCase {
  constructor(
    private creditsRepository: CreditsRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreditType): Promise<object> {
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

    const response = await this.creditsRepository.update(dataReturn)

    return response
  }
}
