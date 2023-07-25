import { PrismaBanksRepository } from '@/repositories/prisma/bank-repository'
import { SearchBankUseCase } from '../search-banks'

export function makeSearchBankUseCase() {
  const bankRepository = new PrismaBanksRepository()

  const useCase = new SearchBankUseCase(bankRepository)

  return useCase
}
