import { PrismaGainsProjectionRepository } from '@/repositories/prisma/gains-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { UpdateGainsProjectionUseCase } from '../update-gains-projection'

export function makeUpdateGainsProjectionUseCase() {
  const gainsProjectionRepository = new PrismaGainsProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const updateGainsProjectionUseCase = new UpdateGainsProjectionUseCase(
    gainsProjectionRepository,
    organizationsRepository,
  )

  return updateGainsProjectionUseCase
}

