import { GainsProjectionRepository } from '@/repositories/gains-projection-repository'
import { OrganizationsRepository } from '@/repositories/organization-repository'

import { OrganizationNotFound } from './errors/organization-not-found-error'

interface GainProjectionType {
  organizationId: string
  transactionId: string
  deleteAllInGroup?: boolean
}

export class DeleteGainsProjectionUseCase {
  constructor(
    private gainsProjectionRepository: GainsProjectionRepository,
    private organizationsRepository: OrganizationsRepository,
  ) {}

  async execute(data: GainProjectionType): Promise<object> {
    const { organizationId, transactionId, deleteAllInGroup = false } = data

    const organization = await this.organizationsRepository.findById(
      organizationId,
    )
    if (!organization) throw new OrganizationNotFound()

    if (deleteAllInGroup) {
      // Find the transaction to get its group_installment_id
      const transaction = await this.gainsProjectionRepository.findById(
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
        return await this.gainsProjectionRepository.delete(transactionId)
      }

      // Delete all transactions in the group (with organization filter for security)
      return await this.gainsProjectionRepository.deleteManyByGroupId(
        transaction.group_installment_id,
        organizationId,
      )
    }

    // Default behavior: delete only the single transaction
    const response = await this.gainsProjectionRepository.delete(transactionId)

    return response
  }
}
