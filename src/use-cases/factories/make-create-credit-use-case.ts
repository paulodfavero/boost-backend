import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { CreateCreditUseCase } from '../create-credit'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateCreditUseCase() {
  const creditRepository = new PrismaCreditRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateCreditUseCase(creditRepository, organizationRepository)

  return useCase
}
