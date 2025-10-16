import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { GetOrganizationByEmailUseCase } from '../get-organization-by-email'

export function makeGetOrganizationByEmailUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const getOrganizationByEmailUseCase = new GetOrganizationByEmailUseCase(
    organizationsRepository,
  )

  return getOrganizationByEmailUseCase
}
