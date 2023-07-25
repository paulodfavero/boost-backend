import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { DeleteGainUseCase } from '../delete-gain'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeDeleteGainUseCase() {
  const gainRepository = new PrismaGainRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new DeleteGainUseCase(gainRepository, organizationRepository)

  return useCase
}
