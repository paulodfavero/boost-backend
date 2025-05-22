import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { DeleteCreditUseCase } from '../delete-credit'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeDeleteCreditUseCase() {
  const creditRepository = new PrismaCreditRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new DeleteCreditUseCase(creditRepository, organizationRepository)

  return useCase
}
