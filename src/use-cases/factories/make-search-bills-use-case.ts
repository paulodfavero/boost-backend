import { PrismaBillsRepository } from '@/repositories/prisma/bills-repository'
import { SearchBillsUseCase } from '../search-bills'
import { GenerateMonthlyBillsUseCase } from '../generate-monthly-bills'

export function makeSearchBillsUseCase() {
  const billsRepository = new PrismaBillsRepository()

  const generateMonthlyBillsUseCase = new GenerateMonthlyBillsUseCase(
    billsRepository,
  )

  const searchBillsUseCase = new SearchBillsUseCase(
    billsRepository,
    generateMonthlyBillsUseCase,
  )

  return searchBillsUseCase
}
