import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { UpdateCreditUseCase } from '../update-credit'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeUpdateCreditUseCase() {
  const creditRepository = new PrismaCreditRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new UpdateCreditUseCase(creditRepository, organizationRepository)

  return useCase
}
