import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { AuthenticateUseCase } from '../authenticate'

export function makeAuthenticateUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const useCase = new AuthenticateUseCase(organizationsRepository)

  return useCase
}
