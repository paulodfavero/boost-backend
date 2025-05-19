import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { SearchExpenseUseCase } from '../search-expenses'
import { PrismaBankTypeAccountRepository, PrismaBanksRepository} from '@/repositories/prisma/bank-repository'

export function makeSearchExpenseUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const gainRepository = new PrismaGainRepository()
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchExpenseUseCase(expenseRepository, gainRepository, bankRepository, bankTypeAccountRepository)

  return useCase
}
