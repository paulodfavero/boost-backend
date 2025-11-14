import { GainsProjectionRepository } from '@/repositories/gains-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { normalizeCategory } from '@/lib/category-translation'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GainProjectionRepository {
  id: string
  expirationDate?: string | Date | null
  description?: string | null
  company?: string | null
  category?: string | null
  amount?: number | null
  typePayment?: string | null
  installmentCurrent?: number | null
  installmentTotalPayment?: number | null
  paid?: boolean | null
}

interface GainProjectionType {
  organizationId: string
  reqBody: GainProjectionRepository
}

export class UpdateGainsProjectionUseCase {
  constructor(
    private gainsProjectionRepository: GainsProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: GainProjectionType): Promise<object> {
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

    // Normalize category to ensure it's never null or empty
    const normalizedCategory = normalizeCategory(category)

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

    const response = await this.gainsProjectionRepository.update(dataReturn)

    return response
  }
}
