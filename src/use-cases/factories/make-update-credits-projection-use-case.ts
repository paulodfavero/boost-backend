import { PrismaCreditsProjectionRepository } from '@/repositories/prisma/credits-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { UpdateCreditsProjectionUseCase } from '../update-credits-projection'

export function makeUpdateCreditsProjectionUseCase() {
  const creditsProjectionRepository = new PrismaCreditsProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const updateCreditsProjectionUseCase = new UpdateCreditsProjectionUseCase(
    creditsProjectionRepository,
    organizationsRepository,
  )

  return updateCreditsProjectionUseCase
}
