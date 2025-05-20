import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { UpdateOrganizationUseCase } from '../update-organization'

export function makeUpdateOrganizationUseCase() {
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new UpdateOrganizationUseCase(organizationRepository)

  return useCase
}
