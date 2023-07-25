import { PrismaBanksRepository } from '@/repositories/prisma/bank-repository'
import { CreateBankUseCase } from '../create-bank'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateBankUseCase() {
  const bankRepository = new PrismaBanksRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateBankUseCase(bankRepository, organizationRepository)

  return useCase
}
