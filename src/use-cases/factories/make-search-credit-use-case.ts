import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import {
  SearchCreditUseCase,
  SearchCreditCardListUseCase,
} from '../search-credits'
import { PrismaExpenseRepository } from '@/repositories/prisma/expense-repository'
import {
  PrismaBanksRepository,
  PrismaBankTypeAccountRepository,
} from '@/repositories/prisma/bank-repository'

export function makeSearchCreditUseCase() {
  const creditRepository = new PrismaCreditRepository()
  const expenseRepository = new PrismaExpenseRepository()
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchCreditUseCase(
    creditRepository,
    expenseRepository,
    bankRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
export function makeSearchCreditCardListUseCase() {
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchCreditCardListUseCase(bankTypeAccountRepository)

  return useCase
}
