import { PrismaGainsProjectionRepository } from '@/repositories/prisma/gains-projection-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { CreateGainsProjectionUseCase } from '../create-gains-projection'

export function makeCreateGainsProjectionUseCase() {
  const gainsProjectionRepository = new PrismaGainsProjectionRepository()
  const organizationsRepository = new PrismaOrganizationsRepository()

  const createGainsProjectionUseCase = new CreateGainsProjectionUseCase(
    gainsProjectionRepository,
    organizationsRepository,
  )

  return createGainsProjectionUseCase
}

