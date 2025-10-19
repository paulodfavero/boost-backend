import {
  PrismaBanksRepository,
  PrismaBankTypeAccountRepository,
} from '@/repositories/prisma/bank-repository'
import {
  SearchBankTypeAccountUseCase,
  SearchBankUseCase,
} from '../search-banks'

export function makeSearchBankUseCase() {
  const banksRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchBankUseCase(
    banksRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
export function makeSearchBankOrganizationIdsUseCase() {
  const banksRepository = new PrismaBanksRepository()
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()

  const useCase = new SearchBankUseCase(
    banksRepository,
    bankTypeAccountRepository,
  )

  return useCase
}
export function makeSearchBankTypeAccountUseCase() {
  const bankTypeAccountRepository = new PrismaBankTypeAccountRepository()
  const useCase = new SearchBankTypeAccountUseCase(bankTypeAccountRepository)

  return useCase
}
