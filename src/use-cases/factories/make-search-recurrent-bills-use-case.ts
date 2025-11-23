import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { SearchRecurrentBillsUseCase } from '../search-recurrent-bills'
import {
  PrismaBankTypeAccountRepository,
  PrismaBanksRepository,
} from '@/repositories/prisma/bank-repository'

export function makeSearchRecurrentBillsUseCase() {
  const expenseRepository = new PrismaExpenseRepository()
  const creditRepository = new PrismaCreditRepository()
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchRecurrentBillsUseCase(
    expenseRepository,
    creditRepository,
    bankRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
