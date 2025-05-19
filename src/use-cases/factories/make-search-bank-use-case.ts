import { PrismaBanksRepository, PrismaBankTypeAccountRepository } from '@/repositories/prisma/bank-repository'
import { SearchBankTypeAccountUseCase, SearchBankUseCase } from '../search-banks'

export function makeSearchBankUseCase() {
  const bankRepository = new PrismaBanksRepository()

  const useCase = new SearchBankUseCase(bankRepository)

  return useCase
}
export function makeSearchBankTypeAccountUseCase() {
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchBankTypeAccountUseCase(bankTypeAccountRepository)

  return useCase
}
