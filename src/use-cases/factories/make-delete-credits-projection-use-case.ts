import { PrismaCreditsProjectionRepository } from '@/repositories/prisma/credits-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { DeleteCreditsProjectionUseCase } from '../delete-credits-projection'

export function makeDeleteCreditsProjectionUseCase() {
  const creditsProjectionRepository = new PrismaCreditsProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const useCase = new DeleteCreditsProjectionUseCase(
    creditsProjectionRepository,
    organizationsRepository,
  )

  return useCase
}
