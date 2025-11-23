import { PrismaBillsRepository } from '@/repositories/prisma/bills-repository'
import { GenerateMonthlyBillsUseCase } from '../generate-monthly-bills'

export function makeGenerateMonthlyBillsUseCase() {
  const billsRepository = new PrismaBillsRepository()

  const generateMonthlyBillsUseCase = new GenerateMonthlyBillsUseCase(
    billsRepository,
  )

  return generateMonthlyBillsUseCase
}
