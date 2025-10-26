import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface CreditProjectionRepository {
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

interface CreditProjectionType {
  organizationId: string
  reqBody: CreditProjectionRepository
}

export class UpdateCreditsProjectionUseCase {
  constructor(
    private creditsProjectionRepository: CreditsProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreditProjectionType): Promise<object> {
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

    const dataReturn = {
      id,
      description,
      category,
      amount,
      paid,
      installment_current: installmentCurrent,
      expiration_date: expirationDate,
      company,
      type_payment: typePayment,
      installment_total_payment: installmentTotalPayment,
      organizationId,
    }

    const response = await this.creditsProjectionRepository.update(dataReturn)

    return response
  }
}
