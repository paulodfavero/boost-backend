import { PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'
import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { UpdateBankTypeAccountUseCase } from '../update-bank-type-account'

export function makeUpdateBankTypeAccountUseCase() {
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()
  const organizationRepository = new PrismaOrganizationsRepository()

  const useCase = new UpdateBankTypeAccountUseCase(
    bankTypeAccountRepository,
    organizationRepository,
  )

  return useCase
}
