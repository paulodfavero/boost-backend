import { PrismaCreditRepository } from '@/repositories/prisma/credit-repository'
import { SearchRecurrentCreditsUseCase } from '../search-recurrent-credits'
import {
  PrismaBankTypeAccountRepository,
  PrismaBanksRepository,
} from '@/repositories/prisma/bank-repository'

export function makeSearchRecurrentCreditsUseCase() {
  const creditRepository = new PrismaCreditRepository()
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchRecurrentCreditsUseCase(
    creditRepository,
    bankRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
