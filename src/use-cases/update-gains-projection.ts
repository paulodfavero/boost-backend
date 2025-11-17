import { GainsProjectionRepository } from '@/repositories/gains-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'
import { normalizeCategory } from '@/lib/category-translation'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GainProjectionRepository {
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
      const transaction = await this.gainsProjectionRepository.findById(id)

      if (!transaction || !transaction.group_installment_id) {
        // If no group, just update the single transaction
        return await this.gainsProjectionRepository.update(dataReturn)
      }

      // Update all transactions in the group (excluding item-specific fields)
      const { id: _, installmentCurrent, ...groupData } = dataReturn

      return await this.gainsProjectionRepository.updateManyByGroupId(
        transaction.group_installment_id,
        groupData,
      )
    }

    // Default behavior: update only the single transaction
    const response = await this.gainsProjectionRepository.update(dataReturn)

    return response
  }
}
