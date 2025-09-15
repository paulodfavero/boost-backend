import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { SearchGainUseCase } from '../search-gains'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import {
  PrismaBanksRepository,
  PrismaBankTypeAccountRepository,
} from '@/repositories/prisma/bank-repository'

export function makeSearchGainUseCase() {
  const gainRepository = new PrismaGainRepository()
  const expenseRepository = new PrismaExpenseRepository()
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchGainUseCase(
    gainRepository,
    expenseRepository,
    bankRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
