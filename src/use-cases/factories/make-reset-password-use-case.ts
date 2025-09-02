import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { ResetPasswordUseCase } from '../reset-password'

export function makeResetPasswordUseCase() {
  const organizationsRepository = new PrismaOrganizationsRepository()
  const useCase = new ResetPasswordUseCase(organizationsRepository)

  return useCase
}
