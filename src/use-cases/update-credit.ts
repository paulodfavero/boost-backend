
import { OrganizationsRepository } from '@/repositories/organization-repository'

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

    const response = await this.creditsRepository.update(dataReturn)

    return response
  }
}
