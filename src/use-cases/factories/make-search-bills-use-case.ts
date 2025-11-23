import { PrismaBillsRepository } from '@/repositories/prisma/bills-repository'
import { SearchBillsUseCase } from '../search-bills'

export function makeSearchBillsUseCase() {
  const billsRepository = new PrismaBillsRepository()

  const searchBillsUseCase = new SearchBillsUseCase(billsRepository)

  return searchBillsUseCase
}
