import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { GetOrganizationUseCase } from '../get-organization'

export function makeGetOrganizationUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const useCase = new GetOrganizationUseCase(organizationsRepository)

  return useCase
}
