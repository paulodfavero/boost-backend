import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { CreateGainUseCase } from '../create-gain'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateGainUseCase() {
  const gainRepository = new PrismaGainRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateGainUseCase(gainRepository, organizationRepository)

  return useCase
}
