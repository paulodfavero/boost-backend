import { PrismaGainsProjectionRepository } from '@/repositories/prisma/gains-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { DeleteGainsProjectionUseCase } from '../delete-gains-projection'

export function makeDeleteGainsProjectionUseCase() {
  const gainsProjectionRepository = new PrismaGainsProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const useCase = new DeleteGainsProjectionUseCase(
    gainsProjectionRepository,
    organizationsRepository,
  )

  return useCase
}
