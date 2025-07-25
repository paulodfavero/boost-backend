import { PrismaBanksRepository } from '@/repositories/prisma/bank-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { UpdateBankUseCase } from '../update-bank'

export function makeUpdateBankUseCase() {
  const bankRepository = new PrismaBanksRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new UpdateBankUseCase(bankRepository, organizationRepository)

  return useCase
}
