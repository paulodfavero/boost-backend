import { PrismaCreditsProjectionRepository } from '@/repositories/prisma/credits-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { CreateCreditsProjectionUseCase } from '../create-credits-projection'

export function makeCreateCreditsProjectionUseCase() {
  const creditsProjectionRepository = new PrismaCreditsProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const createCreditsProjectionUseCase = new CreateCreditsProjectionUseCase(
    creditsProjectionRepository,
    organizationsRepository,
  )

  return createCreditsProjectionUseCase
}

