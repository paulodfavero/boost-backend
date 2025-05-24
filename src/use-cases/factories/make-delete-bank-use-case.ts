import { PrismaBanksRepository, PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'

import { PrismaOrganizationsRepository } from '@/repositories/prisma/organization-repository'
import { DeleteBankUseCase } from '../delete-bank'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'

export function makeDeleteBankUseCase() {
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()
  const organizationRepository = new PrismaOrganizationsRepository()
  const gainRepository = new PrismaGainRepository()
  const expenseRepository = new PrismaExpenseRepository()
  const creditRepository = new PrismaCreditRepository()

  const useCase = new DeleteBankUseCase(
    bankRepository,
    bankTypeAccountRepository,
    organizationRepository, 
    gainRepository,
    expenseRepository,
    creditRepository,
  )

  return useCase
}
