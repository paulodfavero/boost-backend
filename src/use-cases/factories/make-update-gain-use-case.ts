import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { UpdateGainUseCase } from '../update-gain'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeUpdateGainUseCase() {
  const gainRepository = new PrismaGainRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new UpdateGainUseCase(gainRepository, organizationRepository)

  return useCase
}
