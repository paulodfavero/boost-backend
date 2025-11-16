import { CreditsProjectionRepository } from '@/repositories/credits-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface CreditProjectionType {
  organizationId: string
  transactionId: string
  deleteAllInGroup?: boolean
}

export class DeleteCreditsProjectionUseCase {
  constructor(
    private creditsProjectionRepository: CreditsProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: CreditProjectionType): Promise<object> {
    const { organizationId, transactionId, deleteAllInGroup = false } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    if (deleteAllInGroup) {
      // Find the transaction to get its group_installment_id
      const transaction = await this.creditsProjectionRepository.findById(
        transactionId,
      )

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      // Verify the transaction belongs to the organization
      if (transaction.organizationId !== organizationId) {
        throw new Error('Transaction does not belong to this organization')
      }

      if (!transaction.group_installment_id) {
        // If no group, just delete the single transaction
        return await this.creditsProjectionRepository.delete(transactionId)
      }

      // Delete all transactions in the group (with organization filter for security)
      return await this.creditsProjectionRepository.deleteManyByGroupId(
        transaction.group_installment_id,
        organizationId,
      )
    }

    // Default behavior: delete only the single transaction
    const response = await this.creditsProjectionRepository.delete(
      transactionId,
    )

    return response
  }
}
