import { PrismaUsersRepository } from '@/repositories/prisma/user-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

import { CreateUserUseCase } from '../create-user'

export function makeCreateUserUseCase() {
  const userRepository = new PrismaUsersRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateUserUseCase(userRepository, organizationRepository)

  return useCase
}
