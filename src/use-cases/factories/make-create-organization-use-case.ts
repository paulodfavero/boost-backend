import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { CreateOrganizationUseCase } from '../create-organization'

export function makeCreateOrganizationUseCase() {
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateOrganizationUseCase(organizationRepository)

  return useCase
}
