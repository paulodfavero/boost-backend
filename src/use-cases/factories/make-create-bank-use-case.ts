import { PrismaBanksRepository, PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'
import { CreateBankTypeAccountUseCase, CreateBankUseCase } from '../create-bank'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'

export function makeCreateBankUseCase() {
  const bankRepository = new PrismaBanksRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new CreateBankUseCase(bankRepository, organizationRepository)

  return useCase
}

export function makeCreateBankTypeAccountUseCase() {
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()
  const bankRepository = new PrismaBanksRepository()
  const organizationRepository = new PrismaOrganizationsRepository()
  
  const useCase = new CreateBankTypeAccountUseCase(bankTypeAccountRepository, bankRepository, organizationRepository)

  return useCase
}
