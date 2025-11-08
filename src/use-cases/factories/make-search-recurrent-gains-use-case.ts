import { PrismaGainRepository } from '@/repositories/prisma/gain-repository'
import { SearchRecurrentGainsUseCase } from '../search-recurrent-gains'
import {
  PrismaBankTypeAccountRepository,
  PrismaBanksRepository,
} from '@/repositories/prisma/bank-repository'

export function makeSearchRecurrentGainsUseCase() {
  const gainRepository = new PrismaGainRepository()
  const bankRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchRecurrentGainsUseCase(
    gainRepository,
    bankRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
